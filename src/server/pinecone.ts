// Importing via require to avoid TypeScript issues with package export types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PineconeClient } = require("@pinecone-database/pinecone") as any;

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENV = process.env.PINECONE_ENV;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "githelp";

if (!PINECONE_API_KEY || !PINECONE_ENV) {
    // We'll throw at runtime if not configured
}

const pinecone = new PineconeClient();
let initialized = false;

export async function initPinecone() {
    if (initialized) return;
    await pinecone.init({ apiKey: PINECONE_API_KEY as string, environment: PINECONE_ENV as string });
    initialized = true;
}

export async function upsertVectors(vectors: { id: string; values: number[]; metadata?: any }[]) {
    await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX);
    const batch = 100;
    for (let i = 0; i < vectors.length; i += batch) {
        const chunk = vectors.slice(i, i + batch);
        await index.upsert({ upsertRequest: { vectors: chunk } as any } as any);
    }
}

export async function queryVectors(vector: number[], topK = 5) {
    await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX);
    const resp: any = await index.query({ queryRequest: { vector, topK, includeMetadata: true } } as any);
    return resp;
}
