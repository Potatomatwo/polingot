"use client";
import { Button } from "@/components/ui/button";
import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import Confetti from "react-confetti";
import { useState, useTransition, useEffect } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { toast } from "sonner";
import { Footer } from "./footer";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { reduceHearts } from "@/actions/user-progress";
import { useAudio, useWindowSize, useMount } from "react-use";
import Image from "next/image";
import { ResultCard } from "./result-card";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";
import { sanitizeJapanese, levenshteinDistance, detectLanguage } from "@/lib/jp-utils";

type Props = {
    initialPercentage: number;
    initialHearts: number;
    initialLessonId: number;
    initialLessonChallenges: (typeof challenges.$inferSelect & {
        completed: boolean;
        challengeOptions: typeof challengeOptions.$inferSelect[];
    })[];
    userSubscription: typeof userSubscription.$inferSelect & {
        isActive: boolean;
    } | null;
    nextLessonId?: number;
};

const sanitizeAnswer = (str: string, lang: string) => {
    if (lang === "ja-JP") return sanitizeJapanese(str);
    return str.trim().toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
};

export const Quiz = ({
    initialPercentage,
    initialHearts,
    initialLessonId,
    initialLessonChallenges,
    userSubscription,
    nextLessonId,
}: Props) => {
    // ============================================================
    // ALL HOOKS FIRST — no early returns before this section ends
    // ============================================================
    const isPro = !!userSubscription?.isActive;
    const { open: openHeartsModal } = useHeartsModal();
    const { open: openPracticeModal } = usePracticeModal();
    const [isPracticeMode] = useState(initialPercentage === 100);
    const [hasShownModal, setHasShownModal] = useState(false);
    const [sessionStart] = useState(() => Date.now());
    const [mistakeCount, setMistakeCount] = useState(0);
    const [heartsAtStart] = useState(initialHearts);

    useMount(() => {
        if (initialPercentage === 100 && !hasShownModal) {
            setHasShownModal(true);
            openPracticeModal();
        }
    });

    const { width, height } = useWindowSize();
    const router = useRouter();
    const [finishAudio] = useAudio({ src: "/finished.wav", autoPlay: true });
    const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
    const [incorrectAudio, _i, incorrectControls] = useAudio({ src: "/incorrect.wav" });

    const [pending, startTransition] = useTransition();
    const [lessonId] = useState(initialLessonId);
    const [hearts, setHearts] = useState(initialHearts);

    const [challenges, setChallenges] = useState(() => {
        if (isPracticeMode) {
            return initialLessonChallenges.map(c => ({ ...c, completed: false }));
        }
        return initialLessonChallenges;
    });

    const [percentage, setPercentage] = useState(() => {
        if (isPracticeMode) return 0;
        return initialPercentage;
    });

    const [activeIndex, setActiveIndex] = useState(() => {
        if (isPracticeMode) return 0;
        const uncompletedIndex = challenges.findIndex(c => !c.completed);
        return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    });

    const [selectedOption, setSelectedOption] = useState<number>();
    const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
    const [typedAnswer, setTypedAnswer] = useState("");

    const allChallengesCompleted = challenges.every(c => c.completed);

    // ✅ useEffect with all other hooks, before any early returns
    useEffect(() => {
        if (allChallengesCompleted && challenges.length > 0) {
            const timeSeconds = Math.floor((Date.now() - sessionStart) / 1000);
            const xpEarned = challenges.length * 10;

            fetch("/api/analytics/lesson-complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId,
                    heartsAtStart,
                    heartsAtEnd: hearts,
                    xpEarned,
                    timeSeconds,
                    mistakeCount,
                }),
            });
        }
    }, [allChallengesCompleted]);

    // ============================================================
    // Derived values (not hooks)
    // ============================================================
    const challenge = challenges[activeIndex];
    const options = challenge?.challengeOptions ?? [];
    console.log("Current challenge:", challenge?.type, "Options:", options);
    console.log("allChallengesCompleted:", allChallengesCompleted);
    console.log("activeIndex:", activeIndex, "challenges.length:", challenges.length);
    console.log("Current challenge:", challenge?.type, "Options:", options);
    // ============================================================
    // Handlers (not hooks)
    // ============================================================


    const onNext = () => {
        setActiveIndex(current => current + 1);
        setTypedAnswer("");
        setSelectedOption(undefined);
    };

    const onSelect = (id: number) => {
        if (status !== "none") return;
        setSelectedOption(id);
    };

    const handleTypingChange = (value: string) => {
        if (status !== "none") return;
        setTypedAnswer(value);
    };

    const handleTypingSubmit = (answer: string) => {
        if (status !== "none") return;
        if (isProcessing) return;
        const correctOptions = options.filter(o => o.correct);
        if (!correctOptions.length) return;

            const lang = detectLanguage(correctOptions[0]?.text || "");  // 👈 add
            const userAnswer = sanitizeAnswer(answer, lang);              // 👈 replace

        if (userAnswer.length === 0) {
            toast.error("Please type an answer");
            return;
        }

        let isCorrect = false;

        for (const option of correctOptions) {
            const correctAnswer = sanitizeAnswer(option.text, lang);
            if (userAnswer === correctAnswer) { isCorrect = true; break; }
        }

        if (!isCorrect) {
            for (const option of correctOptions) {
                const correctAnswer = sanitizeAnswer(option.text, lang);
                if (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)) {
                    isCorrect = true; break;
                }
                const distance = levenshteinDistance(userAnswer, correctAnswer);
                const maxLength = Math.max(userAnswer.length, correctAnswer.length);
                const similarity = maxLength > 0 ? (1 - distance / maxLength) : 0;
                if (similarity >= 0.85) { isCorrect = true; break; }
            }
        }

        if (isCorrect) {
            startTransition(() => {
                upsertChallengeProgress(challenge.id)
                    .then(response => {
                        if (response?.error === "hearts") { openHeartsModal(); return; }
                        correctControls.play();
                        setStatus("correct");
                        fetch("/api/analytics/challenge-attempt", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ challengeId: challenge.id, lessonId, correct: true }),
                        });
                        setChallenges(prev => {
                            const updated = [...prev];
                            updated[activeIndex] = { ...updated[activeIndex], completed: true };
                            return updated;
                        });
                        const completedCount = challenges.filter(c => c.completed).length + 1;
                        setPercentage((completedCount / challenges.length) * 100);
                        if (isPracticeMode && !isPro) setHearts(prev => Math.min(prev + 1, 5));
                    })
                    .catch(() => toast.error("Something went wrong. Please try again."));
            });
        } else {
            startTransition(() => {
                reduceHearts(challenge.id, isPracticeMode)
                    .then(response => {
                        if (response?.error === "hearts") { openHeartsModal(); return; }
                        incorrectControls.play();
                        setStatus("wrong");
                        setMistakeCount(prev => prev + 1);
                        fetch("/api/analytics/challenge-attempt", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ challengeId: challenge.id, lessonId, correct: false }),
                        });
                        if (!response?.error && !isPracticeMode && !isPro) {
                            setHearts(prev => Math.max(prev - 1, 0));
                        }
                    })
                    .catch(() => toast.error("Something went wrong. Please try again."));
            });
        }
    };

    const handleSpeakingSuccess = () => {
    correctControls.play();
    setStatus("correct");
    fetch("/api/analytics/challenge-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, lessonId, correct: true }),
    });
    setChallenges(prev => {
        const updated = [...prev];
        updated[activeIndex] = { ...updated[activeIndex], completed: true };
        return updated;
    });
    const completedCount = challenges.filter(c => c.completed).length + 1;
    setPercentage((completedCount / challenges.length) * 100);
    if (isPracticeMode && !isPro) setHearts(prev => Math.min(prev + 1, 5));

    upsertChallengeProgress(challenge.id)
        .then(response => {
            if (response?.error === "hearts") { openHeartsModal(); return; }
        })
        .catch(() => toast.error("Something went wrong. Please try again."));

    // ❌ Remove the auto-advance setTimeout entirely
    // The footer button handles advancing via onContinue
    };

    const handleSpeakingFailure = () => {
        incorrectControls.play();
        setStatus("wrong");
        setMistakeCount(prev => prev + 1);
        if (!isPracticeMode && !isPro) setHearts(prev => Math.max(prev - 1, 0));
        fetch("/api/analytics/challenge-attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ challengeId: challenge.id, lessonId, correct: false }),
        });
        reduceHearts(challenge.id, isPracticeMode)
            .then(response => {
                if (response?.error === "hearts") { openHeartsModal(); return; }
            })
            .catch(() => toast.error("Something went wrong. Please try again."));
    };

    const handleSpeakingSkip = () => {
        startTransition(() => {
            upsertChallengeProgress(challenge.id)
                .then(response => {
                    if (response?.error === "hearts") { openHeartsModal(); return; }
                    setStatus("correct");
                    setChallenges(prev => {
                        const updated = [...prev];
                        updated[activeIndex] = { ...updated[activeIndex], completed: true };
                        return updated;
                    });
                    const completedCount = challenges.filter(c => c.completed).length + 1;
                    setPercentage((completedCount / challenges.length) * 100);
                    const isLastChallenge = activeIndex === challenges.length - 1;
                    if (isLastChallenge) {
                        setStatus("none");
                        setSelectedOption(undefined);
                        setTypedAnswer("");
                    } else {
                        setTimeout(() => {
                            onNext();
                            setStatus("none");
                            setSelectedOption(undefined);
                            setTypedAnswer("");
                        }, 500);
                    }
                })
                .catch(() => toast.error("Something went wrong. Please try again."));
        });
    };

    const [isProcessing, setIsProcessing] = useState(false);
    const onContinue = () => {
        if (!challenge) return;
        if (isProcessing) return;

        if (challenge.type === "SPEAKING") {
            if (status === "wrong") { setStatus("none"); return; }
            if (status === "correct") {
                const isLastChallenge = activeIndex === challenges.length - 1;
                if (isLastChallenge) {
                    setStatus("none");
                    setSelectedOption(undefined);
                    setTypedAnswer("");
                } else {
                    onNext();
                    setStatus("none");
                    setSelectedOption(undefined);
                    setTypedAnswer("");
                }
                return;
            }
            return;
        }

        if (challenge.type === "TYPING" || challenge.type === "LISTENING") {
            if (status === "wrong") { setStatus("none"); setTypedAnswer(""); return; }
            if (status === "correct") { onNext(); setStatus("none"); setTypedAnswer(""); setSelectedOption(undefined); return; }
            if (!typedAnswer.trim()) return;
            setIsProcessing(true);
            handleTypingSubmit(typedAnswer);
            setTimeout(() => setIsProcessing(false), 500); 
            return;
        }

        if (!selectedOption) return;
        if (status === "wrong") { setStatus("none"); setMistakeCount(prev => prev + 1); setSelectedOption(undefined); return; }
        if (status === "correct") { onNext(); setStatus("none"); setSelectedOption(undefined); setTypedAnswer(""); return; }

        const correctOption = options.find(o => o.correct);
        if (!correctOption) return;

        // ✅ Fixed — UI updates immediately
    if (correctOption.id === selectedOption) {
        // ✅ Play audio and update UI immediately
        correctControls.play();
        setStatus("correct");
        setChallenges(prev => {
            const updated = [...prev];
            updated[activeIndex] = { ...updated[activeIndex], completed: true };
            return updated;
        });
        const completedCount = challenges.filter(c => c.completed).length + 1;
        setPercentage((completedCount / challenges.length) * 100);
        if (isPracticeMode && !isPro) setHearts(prev => Math.min(prev + 1, 5));

        fetch("/api/analytics/challenge-attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ challengeId: challenge.id, lessonId, correct: true }),
        });

        // ✅ DB call in background
        upsertChallengeProgress(challenge.id)
            .then(response => {
                if (response?.error === "hearts") openHeartsModal();
            })
            .catch(() => toast.error("Something went wrong."));

    } else {
        // ✅ Wrong answer — update UI immediately
        incorrectControls.play();
        setStatus("wrong");
        setMistakeCount(prev => prev + 1);
        if (!isPracticeMode && !isPro) setHearts(prev => Math.max(prev - 1, 0));

        fetch("/api/analytics/challenge-attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ challengeId: challenge.id, lessonId, correct: false }),
        });

    // ✅ DB call in background
    reduceHearts(challenge.id, isPracticeMode)
        .then(response => {
            if (response?.error === "hearts") openHeartsModal();
        })
        .catch(() => toast.error("Something went wrong."));
}
    };

    const isFooterDisabled = () => {
        if (!challenge) return true;
        if (pending) return true;
        if (status !== "none") return false;
        switch (challenge.type) {
            case "SPEAKING": return false;
            case "TYPING":
            case "LISTENING": return !typedAnswer.trim();
            default: return !selectedOption;
        }
    };

    // ============================================================
    // Early returns AFTER all hooks
    // ============================================================
        if (!challenges || challenges.length === 0) {
            return (
                <>
                    {correctAudio}
                    {incorrectAudio}
                    {finishAudio}
                    <div className="flex flex-col items-center justify-center h-full p-8">
                        <h1 className="text-2xl font-bold">No challenges available</h1>
                        <button onClick={() => router.push("/learn")} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                            Back to Learn
                        </button>
                    </div>
                </>
            );
        }

        if (!challenge && !isPracticeMode && initialPercentage === 100) {
        return (
            <>
                {correctAudio}
                {incorrectAudio}
                {finishAudio}
                <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
                    <Image 
                        src="/finished.svg" 
                        alt="Finish" 
                        className="hidden lg:block" 
                        height={100} 
                        width={100} 
                    />
                    <Image 
                        src="/finished.svg" 
                        alt="Finish" 
                        className="block lg:hidden" 
                        height={50} 
                        width={50} 
                    />
                    <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
                        Lesson Complete!
                    </h1>
                    <p className="text-neutral-500">
                        You've already completed this lesson. Practice it again to earn more hearts!
                    </p>
                    <Footer 
                        lessonId={lessonId} 
                        status="completed" 
                        onCheck={() => router.push("/learn")} 
                    />
                </div>
            </>
        );
    }

    if (allChallengesCompleted && challenges.length > 0) {
        return (
            <>
                {finishAudio}
                {correctAudio} 
                {incorrectAudio}
                <Confetti width={width} height={height} recycle={false} numberOfPieces={500} tweenDuration={10000} />
                <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
                    <Image src="/finished.svg" alt="Finish" className="hidden lg:block" height={100} width={100} />
                    <Image src="/finished.svg" alt="Finish" className="block lg:hidden" height={50} width={50} />
                    <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
                        {isPracticeMode ? "Practice Complete!" : "Great job! You've completed the lesson!"}
                    </h1>
                    <p className="text-neutral-500">
                        {isPracticeMode ? "You've earned +1 heart for practicing!" : "You're ready to move to the next lesson!"}
                    </p>
                    <div className="flex items-center gap-x-4 w-full">
                        <ResultCard variant="points" value={challenges.length * 10} />
                        <ResultCard variant="hearts" value={hearts} />
                    </div>
                    {/* Fixed bottom footer */}
                    <div className="fixed bottom-0 left-0 right-0 h-[100px] border-t-2 bg-white flex items-center justify-between px-6 lg:px-10">
                        {/* Bottom left */}
                        <div>
                            {!isPracticeMode && nextLessonId && (
                                <Button
                                    onClick={() => router.push(`/lesson/${nextLessonId}`)}
                                    variant="secondary"
                                    size="lg"
                                >
                                    Next Lesson →
                                </Button>
                            )}
                        </div>

                        {/* Bottom center */}
                        <div>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="primaryOutline"
                                size="lg"
                            >
                                Practice Again
                            </Button>
                        </div>

                        {/* Bottom right */}
                        <div>
                            <Button
                                onClick={() => router.push("/learn")}
                                variant="default"
                                size="lg"
                            >
                                Back to Learn
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ============================================================
    // Main render
    // ============================================================
    const title = challenge?.type === "ASSIST"
        ? "Select the correct meaning"
        : challenge?.question ?? "";

    return (
        <>
            {incorrectAudio}
            {correctAudio}
            <Header hearts={hearts} percentage={percentage} hasActiveSubscription={isPro} />
            <div className="flex-1">
                <div className="h-full flex items-center justify-center">
                    <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
                        <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
                            {title}
                        </h1>
                        <div>
                            {challenge?.type === "ASSIST" && (
                                <QuestionBubble question={challenge.question} />
                            )}
                            {challenge && (
                                <Challenge
                                    options={options}
                                    onSelect={onSelect}
                                    onTypingSubmit={handleTypingSubmit}
                                    onSpeakingSuccess={handleSpeakingSuccess}
                                    onSpeakingFailure={handleSpeakingFailure}
                                    onSpeakingSkip={handleSpeakingSkip}
                                    typedAnswer={typedAnswer}
                                    onTypingChange={handleTypingChange}
                                    status={status}
                                    setStatus={setStatus}
                                    selectedOption={selectedOption}
                                    disabled={pending}
                                    type={challenge.type}
                                    questionText={challenge.question}
                                    expectedAnswer={options.filter(opt => opt.correct).map(opt => opt.text).join("|")}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {challenge && (
                <Footer
                    disabled={isFooterDisabled()}
                    status={status}
                    onCheck={onContinue}
                    onSkip={handleSpeakingSkip}
                    lessonId={lessonId}
                    challengeType={challenge.type}
                    showSkip={challenge.type === "SPEAKING"}
                />
            )}
        </>
    );
};