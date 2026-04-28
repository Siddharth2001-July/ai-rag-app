// Upstash Vector client — wraps the index so callers don't have to know
// about the env var names or the metadata shape.

import { Index } from "@upstash/vector";

// What we store on every vector. `text` is the original chunk markdown
// (used to build the prompt for the LLM). `source` is the relative path
// like "work/nutrient-solutions-engineer.md" — used for citations.
export type ChunkMetadata = {
  text: string;
  source: string;
};

let index: Index<ChunkMetadata> | undefined;

function getIndex(): Index<ChunkMetadata> {
  if (!index) {
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        "UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN must be set"
      );
    }
    index = new Index<ChunkMetadata>({ url, token });
  }
  return index;
}

export type ChunkRecord = {
  id: string;
  vector: number[];
  metadata: ChunkMetadata;
};

export async function upsertChunks(records: ChunkRecord[]): Promise<void> {
  await getIndex().upsert(records);
}

export type SearchHit = {
  id: string;
  score: number;
  text: string;
  source: string;
};

export async function searchChunks(
  queryVector: number[],
  topK: number
): Promise<SearchHit[]> {
  const results = await getIndex().query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });
  return results.map((r) => ({
    id: String(r.id),
    score: r.score,
    text: r.metadata?.text ?? "",
    source: r.metadata?.source ?? String(r.id),
  }));
}
