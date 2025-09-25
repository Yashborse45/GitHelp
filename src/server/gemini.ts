// Lightweight Gemini (Vertex AI) helpers
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GCP_PROJECT = process.env.GCP_PROJECT || "";
const GEMINI_LOCATION = process.env.GEMINI_LOCATION || "us-central1";
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "textembedding-gecko@001";
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "chat-bison@001";

function vertexUrl(path: string) {
    if (GCP_PROJECT) return `https://${GEMINI_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT}/locations/${GEMINI_LOCATION}/${path}`;
    return `https://${GEMINI_LOCATION}-aiplatform.googleapis.com/v1/${path}`;
}

export async function embedTexts(texts: string[]) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
    if (!texts.length) return [];
    const url = vertexUrl(`publishers/google/models/${EMBEDDING_MODEL}:embedText`);
    const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ instances: texts.map((t) => ({ content: t })) }),
    });
    if (!res.ok) throw new Error(`Gemini embed failed: ${await res.text()}`);
    const j = await res.json();
    const embeddings = j.predictions?.map((p: any) => p.embedding).filter(Boolean) ?? j.embeddings?.map((e: any) => e.embedding).filter(Boolean) ?? [];
    if (!embeddings.length) throw new Error("Could not parse embeddings");
    return embeddings;
}

export async function chatCompletion(prompt: string, maxTokens = 800) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
    const url = vertexUrl(`publishers/google/models/${CHAT_MODEL}:predict`);
    const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ instances: [{ content: prompt }], parameters: { maxOutputTokens: maxTokens } }),
    });
    if (!res.ok) throw new Error(`Gemini chat failed: ${await res.text()}`);
    const j = await res.json();
    return j.predictions?.[0]?.content ?? j.predictions?.[0]?.candidates?.[0]?.content ?? "";
}
