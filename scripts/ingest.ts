// Ingest script — reads every markdown file in /content, embeds it via Google,
// and upserts the vectors into Upstash Vector. Run with `npm run ingest`.

import { config } from "dotenv";
config({ path: ".env.local" });

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { EMBEDDING_MODEL, embedDocuments } from "../lib/embeddings";
import { upsertChunks } from "../lib/vector";

const CONTENT_DIR = join(process.cwd(), "content");

// Walk a directory recursively and collect all .md files.
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await findMarkdownFiles(full)));
    } else if (entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  console.log(`Reading ${CONTENT_DIR}…`);
  const files = await findMarkdownFiles(CONTENT_DIR);
  console.log(`Found ${files.length} markdown files.`);

  // One file = one chunk. The id is the path relative to /content,
  // which makes re-runs idempotent (upsert overwrites by id).
  const chunks = await Promise.all(
    files.map(async (filePath) => {
      const text = await readFile(filePath, "utf-8");
      const id = relative(CONTENT_DIR, filePath);
      return { id, text };
    })
  );

  console.log(`Embedding ${chunks.length} chunks with ${EMBEDDING_MODEL}…`);
  const embeddings = await embedDocuments(chunks.map((c) => c.text));

  if (embeddings.length !== chunks.length) {
    throw new Error(
      `Got ${embeddings.length} embeddings back for ${chunks.length} chunks.`
    );
  }

  const records = chunks.map((chunk, i) => ({
    id: chunk.id,
    vector: embeddings[i],
    metadata: { text: chunk.text, source: chunk.id },
  }));

  console.log(`Upserting ${records.length} vectors to Upstash…`);
  await upsertChunks(records);

  console.log("\nDone. Ingested chunks:");
  for (const c of chunks) console.log(`  • ${c.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
