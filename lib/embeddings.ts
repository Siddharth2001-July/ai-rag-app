// Google Gemini embeddings — used at both ingest time (to embed source documents)
// and query time (to embed the user's question). The same model + dimensions
// MUST be used for both, otherwise the vectors aren't comparable.
//
// Why Google instead of Voyage: the Voyage free tier without a payment method
// caps at 3 requests/minute, which is too tight for a public portfolio app.
// Google's free tier is much more generous and we already have the API key
// for the LLM call, so it's one less account/secret to manage.
//
// gemini-embedding-001 outputs 3072 dims by default but supports dimension
// reduction via outputDimensionality. We request 1024 to match the Upstash
// index dimensions we set when creating it.

import { log } from "./log";

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIM = 1024;

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents`;

// Google's task types let the model produce slightly different vectors
// depending on whether the text is a stored document or a search query —
// the same retrieval-friendly nudge that Voyage's inputType provides.
type GoogleTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

type BatchEmbedResponse = {
  embeddings: { values: number[] }[];
};

async function embed(
  texts: string[],
  taskType: GoogleTaskType
): Promise<number[][]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: EMBEDDING_DIM,
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    log.error("embeddings", "Google API non-2xx", undefined, {
      status: res.status,
      taskType,
      inputs: texts.length,
      body: body.slice(0, 400),
    });
    throw new Error(`Google Embedding API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as BatchEmbedResponse;
  if (!data.embeddings || data.embeddings.length !== texts.length) {
    log.error("embeddings", "embedding count mismatch", undefined, {
      expected: texts.length,
      got: data.embeddings?.length ?? 0,
    });
    throw new Error(
      `Expected ${texts.length} embeddings, got ${data.embeddings?.length ?? 0}`
    );
  }
  return data.embeddings.map((e) => e.values);
}

// Embed source documents (use at ingest time).
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  return embed(texts, "RETRIEVAL_DOCUMENT");
}

// Embed a user query (use at search time).
export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embed([text], "RETRIEVAL_QUERY");
  return vector;
}
