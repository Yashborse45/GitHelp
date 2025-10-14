"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer, preprocessGeminiText } from "@/components/ui/markdown-renderer";
import { Textarea } from "@/components/ui/textarea";
import { useFormDraft } from "@/hooks/use-cached-queries";
import { type Citation } from "@/lib/ask-api";
import { api } from "@/trpc/react";
import { Bot, Cloud, Loader2, MessageCircle, Send, User } from "lucide-react";
import { useEffect, useState, memo, useCallback, useRef } from "react";
import CodeReferences from "./code-references";

interface QAComponentProps {
    projectId: string;
}

interface QAItem {
    id: string;
    question: string;
    answer: string;
    citations: Citation[];
    createdAt: string;
}

// Memoized QA History Item to prevent unnecessary re-renders during typing
const QAHistoryItem = memo(({ qa, index }: { qa: QAItem; index: number }) => (
    <Card
        key={qa.id}
        className="border-l-4 border-l-gray-300 animate-in slide-in-from-bottom-5 duration-300 w-full overflow-hidden"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <CardContent className="pt-6">
            <div className="space-y-4">
                {/* Question */}
                <div className="flex items-start gap-3">
                    <User className="h-5 w-5 mt-1 text-blue-600" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">You asked:</h4>
                        <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800 break-words overflow-wrap-anywhere">{qa.question}</p>
                    </div>
                </div>

                {/* Answer */}
                <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 mt-1 text-green-600" />
                    <div className="flex-1">
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">AI Assistant:</h4>
                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 overflow-hidden">
                            <MarkdownRenderer
                                content={preprocessGeminiText(qa.answer)}
                                variant="compact"
                                className="break-words"
                            />
                        </div>
                    </div>
                </div>

                {/* Code References */}
                {qa.citations && qa.citations.length > 0 && (
                    <CodeReferences citations={qa.citations} />
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                    Asked on {new Date(qa.createdAt).toLocaleString()}
                </div>
            </div>
        </CardContent>
    </Card>
));

QAHistoryItem.displayName = 'QAHistoryItem';

export default function QAComponent({ projectId }: QAComponentProps) {
    const [question, setQuestion] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [pendingAnswer, setPendingAnswer] = useState<QAItem | null>(null);
    const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Use tRPC query for Q&A history (no caching issues)
    const { data: qaHistoryData = [], isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = api.qa.list.useQuery(
        { projectId },
        { enabled: !!projectId }
    );

    // Transform database records to QAItem format
    const qaHistory: QAItem[] = qaHistoryData.map((item) => {
        let citations: Citation[] = [];
        try {
            citations = item.citations ? JSON.parse(item.citations) : [];
        } catch (e) {
            console.error('Failed to parse citations:', e);
        }
        return {
            id: item.id,
            question: item.question,
            answer: item.answer,
            citations: citations,
            createdAt: item.createdAt.toISOString(),
        };
    });

    // Use tRPC mutation for asking questions
    const askQuestionMutation = api.qa.ask.useMutation({
        onSuccess: () => {
            // Refetch history after successful question
            refetchHistory();
        }
    });

    // Use form draft for auto-saving questions
    const { data: draftQuestion, saveDraft } = useFormDraft(`qa_question_${projectId}`);

    // Load draft question on mount
    useEffect(() => {
        if (draftQuestion && !question) {
            setQuestion(draftQuestion);
        }
    }, [draftQuestion, question]);

    // Auto-save draft when question changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (question.trim()) {
                saveDraft(question);
            }
        }, 1000); // Save after 1 second of no typing

        return () => clearTimeout(timeoutId);
    }, [question, saveDraft]);

    // Clear states when project changes
    useEffect(() => {
        setQuestion("");
        setError(null);
        setIsTyping(false);
        setCurrentAnswer("");
        setPendingAnswer(null);
    }, [projectId]);

    // Improved, ultra-fast typing effect for answers
    const typeAnswer = useCallback((answer: string, qaItem: QAItem) => {
        setIsTyping(true);
        setCurrentAnswer("");
        setPendingAnswer(qaItem);

        let index = 0;
        // Ultra-fast: show more chars per frame, barely any delay
        const typeSpeed = 0; // ms between frames (as fast as possible)
        const minCharsPerFrame = 5;
        const charsPerFrame = answer.length > 400 ? Math.max(Math.floor(answer.length / 30), minCharsPerFrame) : minCharsPerFrame;

        // Clean up any previous timer
        if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
        }

        typingTimerRef.current = setInterval(() => {
            if (index < answer.length) {
                const nextChars = answer.slice(index, index + charsPerFrame);
                setCurrentAnswer(prev => prev + nextChars);
                index += charsPerFrame;
            } else {
                if (typingTimerRef.current) clearInterval(typingTimerRef.current);
                setTimeout(() => {
                    setIsTyping(false);
                    setPendingAnswer(null);
                    setCurrentAnswer("");
                    refetchHistory();
                }, 50); // Almost instant transition
            }
        }, typeSpeed);

    }, [refetchHistory]);

    useEffect(() => {
        // Clean up timer on unmount or when answer is completed
        return () => {
            if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        };
    }, []);

    const handleAskQuestion = useCallback(async () => {
        if (!question.trim()) return;

        setError(null);

        // Clear any ongoing typing animation
        setIsTyping(false);
        setCurrentAnswer("");
        setPendingAnswer(null);
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);

        try {
            // Use the tRPC mutation
            const result = await askQuestionMutation.mutateAsync({
                projectId,
                question: question.trim()
            });

            // result is { answer: Answer } where Answer is the database record
            const savedAnswer = result.answer;

            // Parse citations from JSON string
            let citations: Citation[] = [];
            try {
                citations = savedAnswer.citations ? JSON.parse(savedAnswer.citations) : [];
            } catch (e) {
                console.error('Failed to parse citations:', e);
            }

            const qaItem: QAItem = {
                id: savedAnswer.id,
                question: savedAnswer.question,
                answer: savedAnswer.answer,
                citations: citations,
                createdAt: savedAnswer.createdAt.toISOString(),
            };

            // Clear the question input and draft
            setQuestion("");
            saveDraft("");

            // Start ultra-fast typing animation
            typeAnswer(savedAnswer.answer, qaItem);
        } catch (error) {
            console.error('Error asking question:', error);
            setError('Failed to ask question. Please try again.');
        }
    }, [projectId, question, askQuestionMutation, saveDraft, typeAnswer]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleAskQuestion();
        }
    }, [handleAskQuestion]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 overflow-hidden">
            {/* Question Input */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Ask a Question
                        <Badge variant="secondary" className="ml-2">
                            <Cloud className="h-3 w-3 mr-1" />
                            Powered by Gemini AI
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Ask anything about this project... (Ctrl+Enter to send)"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={3}
                        className="resize-none"
                        disabled={askQuestionMutation.isPending || isTyping}
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                            Press Ctrl+Enter to send
                        </span>
                        <Button
                            onClick={handleAskQuestion}
                            disabled={!question.trim() || askQuestionMutation.isPending || isTyping}
                            className="flex items-center gap-2 min-w-[100px]"
                        >
                            {askQuestionMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="animate-pulse">Thinking...</span>
                                </>
                            ) : isTyping ? (
                                <>
                                    <Bot className="h-4 w-4 animate-pulse" />
                                    <span className="animate-pulse">Typing...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send
                                </>
                            )}
                        </Button>
                    </div>

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {askQuestionMutation.isPending && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg animate-slide-in">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                                <div className="flex-1">
                                    <p className="text-blue-800 dark:text-blue-200 font-medium">AI is analyzing your question...</p>
                                    <div className="flex gap-1 mt-2">
                                        <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Q&A History */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conversation</h3>

                {/* Show pending answer with typing animation */}
                {pendingAnswer && (
                    <Card className="border-l-4 border-l-blue-500 animate-in slide-in-from-bottom-5 duration-500 w-full overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* Question */}
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 mt-1 text-blue-600" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">You asked:</h4>
                                        <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">{pendingAnswer.question}</p>
                                    </div>
                                </div>

                                {/* Typing Answer */}
                                <div className="flex items-start gap-3">
                                    <Bot className="h-5 w-5 mt-1 text-green-600 animate-pulse" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                                            AI Assistant
                                            <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-full animate-pulse">
                                                typing...
                                            </span>
                                        </h4>
                                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 overflow-hidden">
                                            <MarkdownRenderer
                                                content={preprocessGeminiText(currentAnswer)}
                                                variant="compact"
                                                className="text-sm break-words"
                                            />
                                            <span className="inline-block w-0.5 h-5 bg-green-600 ml-1 animate-pulse"></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Code References for pending answer */}
                                {pendingAnswer.citations && pendingAnswer.citations.length > 0 && (
                                    <CodeReferences citations={pendingAnswer.citations} />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Existing Q&A History */}
                {qaHistory.length === 0 && !pendingAnswer ? (
                    <Card className="w-full">
                        <CardContent className="text-center py-8 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-foreground">No questions asked yet. Ask your first question above!</p>
                        </CardContent>
                    </Card>
                ) : (
                    qaHistory.map((qa: QAItem, index: number) => (
                        <QAHistoryItem key={qa.id} qa={qa} index={index} />
                    ))
                )}
            </div>
        </div >
    );
}
