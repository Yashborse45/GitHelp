import { api } from "@/trpc/react";
import { useRouter } from "next/router";
import { useState } from "react";

export function CreateProject() {
    const [name, setName] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [token, setToken] = useState("");
    const router = useRouter();
    const create = api.project.create.useMutation();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const project = await create.mutateAsync({ name, repoUrl, token });
        router.push(`/projects/${project.id}`);
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md p-4 border rounded">
            <div className="mb-2">
                <label className="block text-sm">Project name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="mb-2">
                <label className="block text-sm">GitHub repo URL</label>
                <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="mb-2">
                <label className="block text-sm">GitHub token (optional)</label>
                <input value={token} onChange={(e) => setToken(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded">Create</button>
        </form>
    );
}
