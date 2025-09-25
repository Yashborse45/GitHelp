import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function ProjectPage() {
    const router = useRouter();
    const { id } = router.query as { id?: string };
    const { isLoaded, isSignedIn } = useUser();

    const [question, setQuestion] = useState("");
    const askMutation = api.qa.ask.useMutation({
        onError: (e) => toast.error(e.message || "Failed to ask question"),
    });
    const ingestPlanQuery = api.project.ingestPlan.useQuery(
        { projectId: id as string },
        { enabled: !!id, refetchOnWindowFocus: false }
    );
    const ingestMutation = api.project.ingest.useMutation({
        onMutate: async () => {
            toast.message("Starting ingestion...", { description: "Fetching repository file list" });
        },
        onError: (e) => toast.error(e.message || "Ingestion failed"),
        onSuccess: (d) => {
            toast.success(`Ingested ${d.processedFiles}/${d.totalFiles} files successfully!`);
            // Refresh answers to reflect any new context for subsequent questions
            answersQuery.refetch();
            // Refresh preflight so button label resets with updated count (if repo changed)
            ingestPlanQuery.refetch();
        },
    });
    const answersQuery = api.qa.list.useQuery(
        { projectId: id as string },
        { enabled: !!id }
    );

    // For tRPC v11 + react-query 5, mutation pending state is exposed via isPending
    const ingestPending = ingestMutation.isPending;
    const askPending = askMutation.isPending;

    const parsedAnswers = useMemo(() => {
        return (answersQuery.data || []).map((a: any) => {
            let citations: any[] = [];
            try {
                citations = a.citations ? JSON.parse(a.citations) : [];
            } catch (_) {
                // ignore
            }
            return { ...a, citations };
        });
    }, [answersQuery.data]);

    async function handleIngest() {
        if (!id || ingestMutation.isPending) return;
        await ingestMutation.mutateAsync({ projectId: id });
    }

    async function handleAsk(e: React.FormEvent) {
        e.preventDefault();
        if (!id || !question.trim()) return;
        await askMutation.mutateAsync({ projectId: id, question: question.trim() });
        setQuestion("");
        answersQuery.refetch();
    }

    if (!isLoaded) {
        return <div className="p-6 text-sm text-muted-foreground">Loading auth...</div>;
    }
    if (!isSignedIn) {
        return <div className="p-6 text-sm text-destructive">You must be signed in to view this project.</div>;
    }
    if (!id) {
        return <div className="p-6 text-sm">Missing project id.</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Project</h1>
                <button
                    onClick={handleIngest}
                    disabled={ingestPending || !ingestPlanQuery.data}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-60"
                >
                    {ingestPending
                        ? `Processing ${ingestPlanQuery.data?.totalFiles ?? "..."} files...`
                        : ingestPlanQuery.data
                            ? `Ingest Repository (${ingestPlanQuery.data.totalFiles})`
                            : "Loading..."}
                </button>
            </div>

            <form onSubmit={handleAsk} className="space-y-3">
                <label className="block text-sm font-medium">Ask a question</label>
                <div className="flex gap-2">
                    <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask about the repository..."
                        className="flex-1 p-2 border rounded bg-background"
                        disabled={askPending}
                    />
                    <button
                        type="submit"
                        disabled={askPending || !question.trim()}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-60"
                    >
                        {askPending ? "Asking..." : "Ask"}
                    </button>
                </div>
                {askMutation.isError && (
                    <p className="text-xs text-destructive">{askMutation.error?.message}</p>
                )}
            </form>

            <div>
                <h2 className="text-lg font-semibold mb-2">Saved Answers</h2>
                {answersQuery.isLoading && (
                    <div className="text-sm text-muted-foreground">Loading answers...</div>
                )}
                {!answersQuery.isLoading && parsedAnswers.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                        No answers yet. Ingest your repository and ask a question to see answers here.
                    </div>
                )}
                <div className="space-y-4">
                    {parsedAnswers.map((a) => (
                        <div key={a.id} className="border p-4 rounded bg-card group relative">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="text-sm font-medium text-foreground flex-1">
                                    Q: {a.question}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(a.answer || "");
                                        toast.success("Answer copied");
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                                    type="button"
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="prose mb-3 whitespace-pre-wrap text-foreground text-sm leading-relaxed">{a.answer}</div>
                            {a.citations.length > 0 && (
                                <details className="text-sm">
                                    <summary className="cursor-pointer text-primary">Citations ({a.citations.length})</summary>
                                    <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-muted-foreground">
                                        {a.citations.map((c: any, i: number) => {
                                            const fileUrl = c.path.startsWith("http") ? c.path : undefined; // placeholder; could map to repo file viewer
                                            return (
                                                <li key={i} className="">
                                                    {fileUrl ? (
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-mono text-[11px] underline decoration-dotted hover:text-primary"
                                                        >
                                                            {c.path}
                                                        </a>
                                                    ) : (
                                                        <span className="font-mono text-[11px]">{c.path}</span>
                                                    )}
                                                    <span className="opacity-70 ml-1">chunk {c.chunkIndex}</span>
                                                    {c.excerpt && (
                                                        <div className="mt-1 border-l pl-2 italic line-clamp-3">{c.excerpt}</div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
