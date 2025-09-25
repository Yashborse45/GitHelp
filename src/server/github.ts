import { Octokit } from "octokit";
// Importing the filtering helper. This creates a mild circular dependency (rag -> github for the RepoFile type
// and github -> rag for shouldIgnore) but it's safe because rag only imports the type (erased at runtime).
// If this grows, consider extracting shared filtering logic into a separate module (e.g. filter.ts).
import { shouldIgnore } from "./rag";

export type RepoFile = {
    path: string;
    content: string;
};

export async function listRepoFiles(owner: string, repo: string, token?: string): Promise<RepoFile[]> {
    const octokit = new Octokit({ auth: token || process.env.GITHUB_TOKEN });

    // 1. Resolve default branch
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const branch = repoData.default_branch || "main";

    // 2. Recursively list tree (one network call) on that branch
    const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: "true",
    });

    const candidateFiles = (treeData.tree || []).filter((t: any) => t.type === "blob" && t.path);

    const filteredFiles = candidateFiles
        .filter((t: any) => !shouldIgnore(t.path)) // central ignore logic
        // Fast size guard (Git tree lists size in bytes for blobs); skip huge > ~200k like ingest side.
        .filter((t: any) => typeof t.size !== "number" || t.size <= 200_000)
        .map((t: any) => t.path as string);

    const results: RepoFile[] = [];

    for (const path of filteredFiles) {
        try {
            const { data: fileData } = await octokit.rest.repos.getContent({ owner, repo, path });
            // fileData.content is base64 when single file. If it returns an array (e.g. directory) skip gracefully.
            // @ts-ignore - GitHub types union; we only handle file case here.
            if (Array.isArray(fileData)) continue;
            const contentEncoded = (fileData as any).content;
            const encoding = (fileData as any).encoding || "base64";
            let content = "";
            if (encoding === "base64" && typeof contentEncoded === "string") {
                content = Buffer.from(contentEncoded, "base64").toString("utf-8");
            } else {
                content = contentEncoded || "";
            }
            // Final guard: empty or still ignored (in case patterns change mid-run)
            if (!content || shouldIgnore(path)) continue;
            results.push({ path, content });
        } catch (e) {
            console.warn("Failed to fetch file", path, e);
        }
    }

    return results;
}
