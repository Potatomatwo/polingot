import { challengeOptions, challenges } from "@/db/schema"
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { SpeakingChallenge } from "@/components/speaking-challenge";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { detectLanguage } from "@/lib/jp-utils";

type Props = {
    options: typeof challengeOptions.$inferSelect[];
    onSelect: (id: number) => void;
    onTypingSubmit?: (answer: string) => void;
    onSpeakingSuccess?: () => void;
    onSpeakingFailure?: () => void;
    onSpeakingSkip?: () => void;
    status: "correct" | "wrong" | "none";
    setStatus?: (status: "correct" | "wrong" | "none") => void;
    selectedOption?: number;
    typedAnswer?: string;
    onTypingChange?: (value: string) => void;
    disabled?: boolean;
    type: typeof challenges.$inferSelect["type"];
    questionText?: string;
    expectedAnswer?: string;
};

export const Challenge = ({
    options,
    onSelect,
    onTypingSubmit,
    onSpeakingSuccess,
    onSpeakingFailure,
    onSpeakingSkip,
    status,
    setStatus,
    selectedOption,
    typedAnswer = "",
    onTypingChange,
    disabled,
    type,
    questionText = "",
    expectedAnswer = "",
}: Props) => {
const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onTypingSubmit && typedAnswer.trim() && status === "none") {
        onTypingSubmit(typedAnswer);
    }
};

    if (type === "SPEAKING") {
        const correctOption = options.find(opt => opt.correct);
        const answerText = correctOption?.text || expectedAnswer;
        return (
            <SpeakingChallenge
                expectedAnswer={answerText}
                questionText={questionText}
                onSuccess={onSpeakingSuccess || (() => {})}
                onFailure={onSpeakingFailure || (() => {})}
                disabled={disabled}
                status={status}
                setStatus={setStatus || (() => {})}
            />
        );
    }

    if (type === "LISTENING") {
        const correctOptions = options.filter(opt => opt.correct);
        const audioOption = options.find(opt => opt.audioSrc);
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-6">
                    {audioOption?.audioSrc ? (
                        <Button
                            onClick={() => {
                                const audio = new Audio(audioOption.audioSrc!);
                                audio.play();
                            }}
                            variant="primary"
                            size="lg"
                            className="mb-6"
                            disabled={disabled}
                        >
                            <Volume2 className="h-5 w-5 mr-2" />
                            Listen to Audio
                        </Button>
                    ) : (
                        <div className="text-amber-600 text-sm mb-6">
                            No audio file available for this challenge.
                        </div>
                    )}
                </div>
                <div className="mb-4">
                    <p className="text-lg text-neutral-600 mb-2">Type what you heard:</p>
                    <input
                        type="text"
                        value={typedAnswer}
                        onChange={(e) => onTypingChange?.(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={disabled || status !== "none"}
                        placeholder="Type your answer here..."
                        className={cn(
                            "w-full p-4 text-lg border-2 rounded-xl focus:outline-none focus:border-sky-500 transition",
                            disabled && "opacity-50 cursor-not-allowed",
                            status === "correct" && "border-green-500 bg-green-50",
                            status === "wrong" && "border-rose-500 bg-rose-50"
                        )}
                        autoFocus
                    />
                </div>
                {status === "wrong" && correctOptions.length > 0 && (
                    <div className="mt-2 text-sm text-rose-600">
                        Expected: {correctOptions.map(opt => `"${opt.text}"`).join(" or ")}
                        {typedAnswer && (
                            <div className="text-xs text-neutral-500 mt-1">
                                You typed: "{typedAnswer}"
                            </div>
                        )}
                    </div>
                )}
                {status === "correct" && (
                    <div className="mt-2 p-3 rounded-lg text-sm text-green-600 bg-green-50">
                        ✓ Correct!
                    </div>
                )}
            </div>
        );
    }

    if (type !== "TYPING") {
        return (
            <div className="space-y-4">
                <div className={cn(
                    "grid gap-2",
                    type === "ASSIST" && "grid-cols-1",
                    type === "SELECT" && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
                )}>
                    {options.map((option, i) => (
                        <Card
                            key={option.id}
                            id={option.id}
                            text={option.text}
                            imageSrc={option.imageSrc}
                            shortcut={`${i + 1}`}
                            selected={selectedOption === option.id}
                            onClick={() => onSelect(option.id)}
                            status={status}
                            audioSrc={option.audioSrc}
                            disabled={disabled}
                            type={type}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // TYPING type — all variables defined inside component
    const correctOptions = options.filter(opt => opt.correct);
    const audioOption = options.find(opt => opt.audioSrc);
    const firstCorrectOption = correctOptions[0];

    const playAudio = () => {
        if (audioOption?.audioSrc) {
            const audio = new Audio(audioOption.audioSrc);
            audio.play().catch(() => {});
        } else if (firstCorrectOption?.text) {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(firstCorrectOption.text);
            utterance.lang = detectLanguage(firstCorrectOption.text); // 👈 auto-detect
            utterance.rate = 0.8;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4 flex justify-center">
                <button
                    onClick={playAudio}
                    disabled={disabled}
                    className="flex items-center gap-x-2 px-4 py-2 rounded-xl border-2 border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-600 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Volume2 className="h-5 w-5" />
                    {audioOption?.audioSrc ? "Play Audio" : "Listen to Answer"}
                </button>
            </div>
            <div className="mb-4">
                <p className="text-lg text-neutral-600 mb-2">Type your answer:</p>
                <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => onTypingChange?.(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled || status !== "none"}
                    placeholder="Type your answer..."
                    className={cn(
                        "w-full p-4 text-lg border-2 rounded-xl focus:outline-none focus:border-sky-500 transition",
                        disabled && "opacity-50 cursor-not-allowed",
                        status === "correct" && "border-green-500 bg-green-50",
                        status === "wrong" && "border-rose-500 bg-rose-50"
                    )}
                    autoFocus
                />
            </div>
            {status === "wrong" && correctOptions.length > 0 && (
                <div className="mt-2 text-sm text-rose-600">
                    Expected: {correctOptions.map(opt => `"${opt.text}"`).join(" or ")}
                    {typedAnswer && (
                        <div className="text-xs text-neutral-500 mt-1">
                            You typed: "{typedAnswer}"
                        </div>
                    )}
                </div>
            )}
            {correctOptions.length > 0 && status !== "none" && status !== "wrong" && (
                <div className={cn(
                    "p-3 rounded-lg text-sm",
                    status === "correct" ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50"
                )}>
                    {status === "correct" ? "✓ Correct!" : `Correct answer: ${correctOptions.map(opt => opt.text).join(" or ")}`}
                </div>
            )}
        </div>
    );
};