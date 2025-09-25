import crypto from "crypto";
import { embedTexts } from "./gemini";
import type { RepoFile } from "./github";
import { upsertVectors } from "./pinecone";

// Ignore patterns for repository file ingestion. Keep in sync with filtering in github.ts.
// Quick-win approach: simple substring / extension checks (not full globbing yet).
const IGNORE_SUBSTRINGS = [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    ".git/",
    ".next/",
];
const IGNORE_FILENAMES = [
    "yarn.lock",
    "package-lock.json",
];
const IGNORE_EXTENSIONS = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".exe",
    ".pdf",
];

export function shouldIgnore(filePath: string): boolean {
    const lower = filePath.toLowerCase();
    if (IGNORE_FILENAMES.some((f) => lower.endsWith("/" + f) || lower === f)) return true;
    if (IGNORE_SUBSTRINGS.some((s) => lower.includes(s))) return true;
    if (IGNORE_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
    return false;
}

function hashText(text: string) {
    return crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);
}

// Safe chunker
function chunkText(text: string, chunkSize = 1000, overlap = 200) {
    const chunks: string[] = [];
    for (let start = 0; start < text.length; start += chunkSize - overlap) {
        const end = Math.min(text.length, start + chunkSize);
        chunks.push(text.slice(start, end));
    }
    return chunks;
}

export async function ingestFilesToPinecone(files: RepoFile[], projectId: string): Promise<{ processedFiles: number }> {
    const vectors: Array<any> = [];
    let processedFiles = 0;

    for (const file of files) {
        if (shouldIgnore(file.path)) continue;
        // Skip empty / excessively large files
        if (!file.content || file.content.length > 200_000) continue;

        const chunks = chunkText(file.content, 800, 200);
        if (!chunks.length) continue;
        processedFiles += 1;
        const embeddings = await embedTexts(chunks);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk == null) continue;
            const embedding = embeddings[i];
            if (!embedding) continue; // guard in case embedTexts returns shorter array
            const hash = hashText(chunk);

            const id = `${projectId}--${file.path}--${i}--${hash}`;
            const metadata = {
                projectId,
                path: file.path,
                chunkIndex: i,
                hash,
                text: chunk.slice(0, 500),
            };

            vectors.push({ id, values: embedding, metadata });

            if (vectors.length >= 100) {
                await upsertVectors(vectors.splice(0, 100));
            }
        }
    }

    if (vectors.length > 0) {
        await upsertVectors(vectors);
    }
    return { processedFiles };
}
