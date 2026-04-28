# Chat with my portfolio

> An AI chat that answers questions about me — my work, projects, skills, and what I'm looking for next — grounded in markdown content I wrote myself, with inline citations.

**🔗 Live demo:** [link goes here after Vercel deploy]

> **Status: v1.** This is a working first version with the full RAG pipeline end-to-end (chunk → embed → retrieve → ground → stream). I plan to keep iterating — see [What I'd build next](#what-id-build-next) for the roadmap.

Built by [Siddharth Kamboj](https://www.linkedin.com/in/siddharth-kamboj-2a99a4187/) — a Solutions Engineer at Nutrient.io exploring AI Engineering. The chat is the portfolio piece *and* the way you explore the rest of my work.

---

## Why I built this

To learn Retrieval-Augmented Generation through real implementation, and to ship something that demonstrates itself: using the chat shows off both my work *and* my ability to build production AI systems at the same time.

It's deliberately small and defensible — every architectural choice is one I can explain in an interview, and every dependency earns its place.

---

## How it works

Two phases. Ingest runs once (or whenever I edit content). Query runs on every chat message.

### Ingest (offline)

```
content/*.md  →  read & chunk  →  embed via Google  →  upsert to Upstash Vector
```

Each markdown file is treated as one chunk. I deliberately wrote each file to be a single coherent topic at 100–400 words — **the cleanest chunking strategy is one you avoid by structuring the source well in the first place**.

### Query (every chat message)

```
user question  →  embed via Google (taskType: query)  →  search Upstash (top 7)
              →  build grounded prompt  →  stream Gemini 2.5 Flash
              →  sources sent to UI via message metadata
```

The system prompt tells Gemini to use *only* the retrieved context and to admit when it doesn't know. The result: grounded answers with inline citations like `[bio.md]`, plus a sources panel rendered next to each response.

---

## Stack

| Piece | Pick | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router) | One repo for UI + serverless API; deploys to Vercel free tier |
| LLM | **Google Gemini 2.5 Flash** | Generous free tier, fast streaming, good instruction-following for grounding |
| Embeddings | **Google `gemini-embedding-001`** | Same API key as the LLM (one less account); supports `outputDimensionality` to fit Upstash's 1024-dim index |
| Vector DB | **Upstash Vector** | Serverless-native, no cold-start issues on Vercel; free tier covers 10k vectors |
| UI | **Tailwind v4 + framer-motion + react-markdown + sonner** | Lightweight, polished, and only the pieces I actually need |
| Hosting | **Vercel Hobby** | Free, plays perfectly with Next.js, env-var management UI is clean |

Total ongoing cost for low-traffic portfolio use: **$0/month**.

---

## Run it locally

You'll need a Google AI Studio API key and an Upstash Vector index (1024 dimensions, cosine similarity). Both have generous free tiers — no payment method required.

```bash
git clone https://github.com/Siddharth2001-July/ai-rag-app
cd ai-rag-app
npm install
cp .env.local.example .env.local      # then fill in the three values
npm run ingest                         # one-time: embeds all content & uploads vectors
npm run dev                            # start the chat at localhost:3000
```

Required env vars (template lives in [.env.local.example](.env.local.example)):

- `GOOGLE_GENERATIVE_AI_API_KEY` — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN` — from your Upstash Vector index's "Connect" tab

---

## Editing the corpus

The chat answers from markdown files in `content/`. To add or change content:

1. Edit or create a `.md` file under `content/` (any subfolder structure is fine — I use `work/`, `projects/`, `faq/`)
2. Run `npm run ingest` — it re-embeds everything and overwrites the old vectors by file path (idempotent)

Each file becomes one chunk, so write each as a single focused topic.

---

## Folder structure

```
ai-rag-app/
├── app/
│   ├── api/chat/route.ts        # RAG query handler — embed → search → stream
│   ├── chat/
│   │   ├── page.tsx              # chat UI: streaming, layout transition, sources
│   │   └── Starfield.tsx         # animated starfield background (canvas)
│   ├── icon.svg                  # SK favicon
│   └── layout.tsx                # root layout with Toaster + metadata
├── content/                      # the source corpus — one chunk per file
│   ├── bio.md  contact.md  skills.md  education.md  github-activity.md
│   ├── work/                     # past + current roles
│   ├── projects/                 # personal projects + this app itself
│   └── faq/                      # opinions, work style, what I'm looking for
├── lib/
│   ├── embeddings.ts             # Google embeddings (document + query)
│   ├── vector.ts                 # Upstash client + chunk metadata types
│   └── log.ts                    # structured logger ([scope] key=value style)
└── scripts/
    └── ingest.ts                 # `npm run ingest` — reads /content, uploads vectors
```

---

## What I'd build next

Honest v2 items if I kept iterating — each one a real talking point about RAG quality:

- **Hybrid search** — combine vector similarity with BM25 keyword search. Vector retrieval misses queries that need exact term matches (specific company names, framework names). BM25 catches those.
- **Cross-encoder re-ranking** — pull top 20–30 chunks by vector similarity, then re-rank with a smaller cross-encoder model. More accurate than raw vector similarity, especially for ambiguous queries.
- **Evals** — a small set of `(question, expected source)` pairs with automated scoring, so changes to chunking, prompts, or models don't quietly regress retrieval quality.
- **Query rewriting for multi-turn** — *"tell me more about that"* is a terrible retrieval query in isolation. A small LLM call to rewrite the latest message as a self-contained question would fix follow-ups.
- **Score thresholds** — when the top hit scores below ~0.6, force a confident "I don't have that information" rather than letting the LLM reach for noise.

---

## What I learned building this

A short list of things that surprised me:

- **Chunking matters more than the embedding model.** The same Google embeddings perform totally differently depending on whether your source files are 100-word focused chunks or 5,000-word documents.
- **Switching embedding models invalidates everything.** Voyage and Google produce vectors in different "spaces" — they aren't comparable. Re-ingest is mandatory after a model swap.
- **System prompts do real work.** "Use ONLY the context" + "admit when you don't know" turn a hallucination engine into a grounded assistant. Removing those rules made the bot start inventing plausible-sounding facts.
- **Streaming is a UX feature, not just a perf one.** Watching tokens appear feels orders-of-magnitude better than a 5-second blank screen, even if total time is identical.
