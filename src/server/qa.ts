import { chatCompletion, embedTexts } from "./gemini";
import { queryVectors } from "./pinecone";

export type Citation = { path: string; chunkIndex: number; excerpt?: string };

export async function answerQuestion(projectId: string, question: string) {
    // Get question embedding
    const qEmbedding = (await embedTexts([question]))[0];

    // Query pinecone
    const queryResp: any = await queryVectors(qEmbedding, 5);
    const matches = (queryResp.matches || []).map((m: any) => ({ id: m.id, score: m.score, metadata: m.metadata }));

    const context = matches.map((m: any) => m.metadata.text).join("\n---\n");

    const prompt = `You are a helpful assistant. Use the following snippets from the repository to answer the question. Cite file paths when relevant.\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;

    const answerText = await chatCompletion(prompt, 800);

    const citations: Citation[] = matches.map((m: any) => ({ path: m.metadata.path, chunkIndex: m.metadata.chunkIndex, excerpt: m.metadata.text }));

    return { answer: answerText, citations };
}
