import { Pinecone, type PineconeRecord } from "@pinecone-database/pinecone";

type ProjectChunkMetadata = {
    projectId: string;
    path: string;
    chunkIndex: number;
    hash: string;
    text: string;
};

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENV = process.env.PINECONE_ENV;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "githelp";

let client: Pinecone | null = null;

function ensureClient(): Pinecone {
    if (!PINECONE_API_KEY) {
        throw new Error(
            "Pinecone is not configured. Please set PINECONE_API_KEY (and optionally PINECONE_ENV / PINECONE_INDEX).",
        );
    }

    if (!client) {
        const config = PINECONE_ENV ? { apiKey: PINECONE_API_KEY, environment: PINECONE_ENV } : { apiKey: PINECONE_API_KEY };
        client = new Pinecone(config);
    }

    return client;
}

function getIndex() {
    const pinecone = ensureClient();
    return pinecone.index<ProjectChunkMetadata>(PINECONE_INDEX);
}

export async function upsertVectors(vectors: PineconeRecord<ProjectChunkMetadata>[]) {
    if (!vectors.length) return;

    const index = getIndex();
    // Pinecone handles chunking internally but we keep small batches to avoid large payloads
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
    }
}

export async function queryVectors(vector: number[], topK = 5) {
    const index = getIndex();
    const response = await index.query({
        vector,
        topK,
        includeMetadata: true,
    });
    return response;
}
