"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Passage = {
    id: number;
    title: string;
    content: string;
    timeLimit: number;
};

type Blank = {
    id: number;
    blankNumber: number;
    correctAnswer: string;
    acceptedAnswers: string | null;
};

type Question = {
    id: number;
    question: string;
    markScheme: string;
    sampleAnswer: string;
    maxMarks: number;
    order: number;
};

type Props = {
    passage: Passage;
    blanks: Blank[];
    questions: Question[];
    userId: string;
};

type Part = "instructions" | "cloze" | "comprehension" | "results";

type Result = {
    blankScore: number;
    blankTotal: number;
    comprehensionResults: {
        questionId: number;
        question: string;
        userAnswer: string;
        score: number;
        maxMarks: number;
        feedback: string;
    }[];
    comprehensionScore: number;
    comprehensionTotal: number;
    timeTaken: number;
};

export const ExamClient = ({ passage, blanks, questions, userId }: Props) => {
    const router = useRouter();
    const [part, setPart] = useState<Part>("instructions");
    const [timeLeft, setTimeLeft] = useState(passage.timeLimit * 60);
    const [timerActive, setTimerActive] = useState(false);
    const [blankAnswers, setBlankAnswers] = useState<Record<number, string>>({});
    const [comprehensionAnswers, setComprehensionAnswers] = useState<Record<number, string>>({});
    const [result, setResult] = useState<Result | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const startTimeRef = useRef<number>(0);

    // Timer
    useEffect(() => {
        if (!timerActive) return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const startExam = () => {
        startTimeRef.current = Date.now();
        setTimerActive(true);
        setPart("cloze");
    };

    // Render passage with input boxes replacing [BLANK_N]
    const renderPassage = () => {
        const parts = passage.content.split(/(\[BLANK_\d+\])/g);
        return parts.map((part, i) => {
            const match = part.match(/\[BLANK_(\d+)\]/);
            if (match) {
                const num = parseInt(match[1]);
                return (
                    <input
                        key={i}
                        type="text"
                        value={blankAnswers[num] || ""}
                        onChange={e => setBlankAnswers(prev => ({ ...prev, [num]: e.target.value }))}
                        className="inline-block border-b-2 border-sky-400 bg-sky-50 rounded px-2 py-0.5 mx-1 text-center focus:outline-none focus:border-sky-600 min-w-[80px]"
                        placeholder={`blank ${num}`}
                    />
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        setTimerActive(false);

        const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

        // Score blanks locally
        let blankScore = 0;
        blanks.forEach(blank => {
            const userAnswer = (blankAnswers[blank.blankNumber] || "").trim().toLowerCase();
            const correct = blank.correctAnswer.trim().toLowerCase();
            const accepted = blank.acceptedAnswers
                ? blank.acceptedAnswers.split("|").map(a => a.trim().toLowerCase())
                : [];
            if (userAnswer === correct || accepted.includes(userAnswer)) {
                blankScore++;
            }
        });

        // Evaluate comprehension with Claude
        const res = await fetch("/api/exam/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                passageContent: passage.content,
                questions: questions.map(q => ({
                    id: q.id,
                    question: q.question,
                    markScheme: q.markScheme,
                    sampleAnswer: q.sampleAnswer,
                    maxMarks: q.maxMarks,
                    userAnswer: comprehensionAnswers[q.id] || "",
                })),
            }),
        });

        const evalData = await res.json();

        const comprehensionScore = evalData.results.reduce((sum: number, r: any) => sum + r.score, 0);
        const comprehensionTotal = questions.reduce((sum, q) => sum + q.maxMarks, 0);

        const finalResult: Result = {
            blankScore,
            blankTotal: blanks.length,
            comprehensionResults: evalData.results,
            comprehensionScore,
            comprehensionTotal,
            timeTaken,
        };

        // Save attempt
        await fetch("/api/exam/attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                passageId: passage.id,
                blankScore,
                comprehensionScore,
                totalScore: blankScore + comprehensionScore,
                timeTaken,
            }),
        });

        setResult(finalResult);
        setPart("results");
        setSubmitting(false);
    };

    // ── INSTRUCTIONS ──
    if (part === "instructions") {
        return (
            <div className="max-w-2xl mx-auto p-8 flex flex-col gap-y-6">
                <h1 className="text-3xl font-bold text-neutral-700">{passage.title}</h1>
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 flex flex-col gap-y-3">
                    <p className="font-semibold text-sky-700">Instructions</p>
                    <ul className="text-sm text-sky-800 space-y-2 list-disc list-inside">
                        <li>This exam has two parts: cloze passage and comprehension questions.</li>
                        <li>Part 1 — fill in the blanks in the passage.</li>
                        <li>Part 2 — answer open-ended questions about the passage.</li>
                        <li>Time limit: <strong>{passage.timeLimit} minutes</strong></li>
                        <li>You have {blanks.length} blanks and {questions.length} comprehension questions.</li>
                        <li>The timer starts when you click "Begin Exam".</li>
                    </ul>
                </div>
                <Button size="lg" onClick={startExam} className="w-full">
                    Begin Exam
                </Button>
            </div>
        );
    }

    // ── CLOZE ──
    if (part === "cloze") {
        const allFilled = blanks.every(b => (blankAnswers[b.blankNumber] || "").trim());
        return (
            <div className="max-w-3xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-3 border-b">
                    <h2 className="font-bold text-lg">Part 1 — Fill in the blanks</h2>
                    <div className={cn(
                        "flex items-center gap-x-2 font-mono font-bold px-4 py-2 rounded-xl",
                        timeLeft < 120 ? "bg-rose-100 text-rose-600" : "bg-sky-100 text-sky-600"
                    )}>
                        <Clock className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Passage */}
                <div className="prose max-w-none text-neutral-700 leading-relaxed text-lg mb-8 p-6 bg-neutral-50 rounded-xl border">
                    {renderPassage()}
                </div>

                <div className="flex justify-between items-center">
                    <p className="text-sm text-neutral-500">
                        {Object.keys(blankAnswers).filter(k => blankAnswers[parseInt(k)]).length} / {blanks.length} blanks filled
                    </p>
                    <Button
                        onClick={() => setPart("comprehension")}
                        disabled={!allFilled}
                        className="flex items-center gap-x-2"
                    >
                        Next: Comprehension <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // ── COMPREHENSION ──
    if (part === "comprehension") {
        const allAnswered = questions.every(q => (comprehensionAnswers[q.id] || "").trim());
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-3 border-b">
                    <h2 className="font-bold text-lg">Part 2 — Comprehension questions</h2>
                    <div className={cn(
                        "flex items-center gap-x-2 font-mono font-bold px-4 py-2 rounded-xl",
                        timeLeft < 120 ? "bg-rose-100 text-rose-600" : "bg-sky-100 text-sky-600"
                    )}>
                        <Clock className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Passage reference */}
                <details className="mb-6 bg-neutral-50 rounded-xl border">
                    <summary className="p-4 cursor-pointer font-medium text-sm text-neutral-600">
                        📖 Show passage for reference
                    </summary>
                    <div className="p-4 pt-0 text-neutral-700 leading-relaxed border-t">
                        {passage.content.replace(/\[BLANK_\d+\]/g, (m) => {
                            const num = parseInt(m.match(/\d+/)![0]);
                            return `[${blankAnswers[num] || "___"}]`;
                        })}
                    </div>
                </details>

                {/* Questions */}
                <div className="flex flex-col gap-y-6 mb-8">
                    {questions.sort((a, b) => a.order - b.order).map((q, i) => (
                        <div key={q.id} className="border rounded-xl p-5">
                            <div className="flex justify-between mb-3">
                                <p className="font-medium text-neutral-700">
                                    {i + 1}. {q.question}
                                </p>
                                <span className="text-sm text-neutral-400 whitespace-nowrap ml-4">
                                    [{q.maxMarks} marks]
                                </span>
                            </div>
                            <textarea
                                value={comprehensionAnswers[q.id] || ""}
                                onChange={e => setComprehensionAnswers(prev => ({
                                    ...prev, [q.id]: e.target.value
                                }))}
                                rows={4}
                                placeholder="Write your answer here..."
                                className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:border-sky-400 resize-none"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-between">
                    <Button variant="ghost" onClick={() => setPart("cloze")}>
                        ← Back to blanks
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!allAnswered || submitting}
                        className="flex items-center gap-x-2"
                    >
                        {submitting ? "Evaluating..." : "Submit exam"}
                        <CheckCircle className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // ── RESULTS ──
    if (part === "results" && result) {
        const total = result.blankScore + result.comprehensionScore;
        const totalPossible = result.blankTotal + result.comprehensionTotal;
        const percent = Math.round((total / totalPossible) * 100);

        return (
            <div className="max-w-2xl mx-auto p-6 flex flex-col gap-y-6">
                <h1 className="text-2xl font-bold text-neutral-700">Results — {passage.title}</h1>

                {/* Score summary */}
                <div className={cn(
                    "rounded-xl p-6 text-center border-2",
                    percent >= 70 ? "bg-green-50 border-green-200" :
                    percent >= 50 ? "bg-amber-50 border-amber-200" :
                    "bg-rose-50 border-rose-200"
                )}>
                    <p className="text-5xl font-bold mb-2">{total}/{totalPossible}</p>
                    <p className="text-2xl font-semibold">{percent}%</p>
                    <p className="text-sm text-neutral-500 mt-2">
                        Time taken: {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                    </p>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border rounded-xl p-4 text-center">
                        <p className="text-sm text-neutral-500 mb-1">Part 1 — Cloze</p>
                        <p className="text-2xl font-bold">{result.blankScore}/{result.blankTotal}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-4 text-center">
                        <p className="text-sm text-neutral-500 mb-1">Part 2 — Comprehension</p>
                        <p className="text-2xl font-bold">{result.comprehensionScore}/{result.comprehensionTotal}</p>
                    </div>
                </div>

                {/* Comprehension feedback */}
                <div className="flex flex-col gap-y-4">
                    <h2 className="font-bold text-lg">Comprehension feedback</h2>
                    {result.comprehensionResults.map((r, i) => (
                        <div key={r.questionId} className="border rounded-xl p-4">
                            <div className="flex justify-between mb-2">
                                <p className="font-medium text-sm">{i + 1}. {r.question}</p>
                                <span className={cn(
                                    "text-sm font-bold px-2 py-0.5 rounded",
                                    r.score === r.maxMarks ? "bg-green-100 text-green-700" :
                                    r.score > 0 ? "bg-amber-100 text-amber-700" :
                                    "bg-rose-100 text-rose-700"
                                )}>
                                    {r.score}/{r.maxMarks}
                                </span>
                            </div>
                            <p className="text-sm text-neutral-500 mb-2">
                                <span className="font-medium">Your answer:</span> {r.userAnswer}
                            </p>
                            <p className="text-sm text-sky-700 bg-sky-50 rounded p-2">
                                💬 {r.feedback}
                            </p>
                        </div>
                    ))}
                </div>

                <Button onClick={() => router.push("/learn")} size="lg">
                    Back to Learn
                </Button>
            </div>
        );
    }

    return null;
};