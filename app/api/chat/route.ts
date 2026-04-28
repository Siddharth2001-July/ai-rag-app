// Chat API route — the heart of RAG at query time.
//
// 1. Take the latest user message
// 2. Embed it via Google (with taskType="RETRIEVAL_QUERY")
// 3. Retrieve the top-K most similar chunks from Upstash
// 4. Build a system prompt that grounds the LLM in those chunks
// 5. Stream Gemini's answer back to the client
// 6. Attach the retrieved sources as message metadata so the UI can show them

import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { embedQuery } from "@/lib/embeddings";
import { searchChunks, type SearchHit } from "@/lib/vector";
import { log } from "@/lib/log";

// How many chunks we retrieve and feed to the LLM as context.
// More chunks = more recall (less likely to miss relevant info) but more
// tokens in the prompt and more risk of "lost in the middle". 7 fits
// our corpus well — enough to surface all project chunks for "what has
// Sid built?" without flooding the prompt with noise.
const TOP_K = 7;

const MODEL = "gemini-2.5-flash";

export const runtime = "nodejs"; // Google + Upstash both work fine on Node

function buildSystemPrompt(hits: SearchHit[]): string {
  const context = hits
    .map(
      (h, i) =>
        `--- Source [${i + 1}]: ${h.source} (similarity: ${h.score.toFixed(3)}) ---\n${h.text}`
    )
    .join("\n\n");

  return `You are an AI assistant on Siddharth Kamboj's portfolio website. Visitors ask questions about Siddharth — his work, skills, projects, background, goals, opinions — and you answer them based ONLY on the CONTEXT below.

Rules:
- Use ONLY the information in the CONTEXT. Do not invent facts. Do not draw on outside knowledge about people, companies, or projects.
- If the context does not contain the answer, say so clearly: "I don't have that information about Siddharth." Do not guess.
- Speak in third person ("Siddharth has…", "He worked at…"), not first person.
- Be conversational but factual. Match the length of your answer to the question — short questions get short answers.
- Use markdown when it helps (lists, bold). Do not use headings unless the answer is genuinely multi-part.
- When you draw on a specific source, cite it inline using its source path in square brackets, e.g. [bio.md] or [work/nutrient-solutions-engineer.md].

CONTEXT (top ${hits.length} most relevant chunks for this query):

${context}`;
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // The latest user message is the query we retrieve against.
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    const queryText = lastUserMessage?.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join(" ")
      .trim();

    if (!queryText) {
      log.warn("chat", "no user query in request");
      return new Response("No user query found", { status: 400 });
    }

    log.info("chat", "query received", {
      query: queryText.slice(0, 120),
      turn: messages.length,
    });

    // Embed query, then search.
    const queryVector = await embedQuery(queryText);
    const hits = await searchChunks(queryVector, TOP_K);

    log.info("chat", "retrieved hits", {
      count: hits.length,
      topScore: hits[0]?.score?.toFixed(3) ?? "n/a",
      sources: hits.map((h) => h.source).join(","),
    });

    // Build a grounded system prompt from the retrieved chunks.
    const system = buildSystemPrompt(hits);

    const result = streamText({
      model: google(MODEL),
      system,
      messages: await convertToModelMessages(messages),
      // streamText errors don't propagate to the route handler — they
      // surface inside the stream. Log them here so they show up in
      // Vercel function logs alongside the request line.
      onError: ({ error }) => {
        log.error("chat", "streamText failed", error, {
          query: queryText.slice(0, 80),
        });
      },
    });

    // Send the source list back to the UI as message metadata so we can
    // render a "Sources" panel next to the streamed answer.
    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return {
            sources: hits.map((h) => ({
              source: h.source,
              score: h.score,
            })),
          };
        }
      },
    });
  } catch (err) {
    log.error("chat", "request failed", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
