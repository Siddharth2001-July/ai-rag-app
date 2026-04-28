# Project: AI RAG App (this site)

**Stack:** Next.js (App Router), TypeScript, Tailwind, Vercel AI SDK, Google Gemini Flash (LLM), Google `gemini-embedding-001` (embeddings), Upstash Vector
**Status:** In development — you're using it right now
**Repo:** (link to be added once published)

## What it is

This very chat app — a Retrieval-Augmented Generation (RAG) system over Siddharth's portfolio content. When you ask a question, the app embeds your query, retrieves the most relevant chunks from a vector database of Siddharth's bio, work history, projects, and FAQs, and uses an LLM (Google Gemini Flash) to generate a grounded answer with citations back to the source chunks.

## Why he built it

To learn AI Engineering through real implementation, and to ship a portfolio piece that demonstrates itself — using the app shows off both Siddharth's work *and* his ability to build production AI systems at the same time.

## Interesting technical decisions

- **Truly serverless on Vercel free tier:** vector DB (Upstash) and LLM (Gemini Flash) are both hosted, so the app cold-starts cleanly on Vercel Hobby and runs at $0 ongoing cost
- **Google embeddings (`gemini-embedding-001`) instead of OpenAI/Voyage** — same Google API key powers both embeddings and the LLM (one less account to manage), plus generous free-tier rate limits. Output dimensions reduced to 1024 via `outputDimensionality` to match the Upstash index — a Matryoshka-embedding feature that lets us trade off quality vs. cost
- **Streaming responses** via Vercel AI SDK's `useChat` hook for a chat UX that feels responsive, not request-response
- **Citations panel** showing which source chunks the LLM saw, so answers are inspectable rather than black-box
- **Markdown-first content:** each piece of source content is a markdown file in a `/content` directory, making it easy to add or edit a section and re-ingest

## v2 ideas

- Hybrid search (BM25 + vector) for queries that need exact term matches (specific company or framework names)
- Re-ranking the retrieved chunks before sending to the LLM, to fight "lost in the middle"
- A small eval set to measure retrieval quality as content grows
