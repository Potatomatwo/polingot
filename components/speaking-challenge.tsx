"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sanitizeJapanese, levenshteinDistance, detectLanguage } from "@/lib/jp-utils";

type SpeakingChallengeProps = {
    expectedAnswer: string;
    questionText: string;
    onSuccess: () => void;
    onFailure: () => void;
    disabled?: boolean;
    status: "correct" | "wrong" | "none";
    setStatus: (status: "correct" | "wrong" | "none") => void;
};

const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectLanguage(text);  // 👈 auto-detect
    utterance.rate = 0.8;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

export const SpeakingChallenge = ({
    expectedAnswer,
    questionText,
    onSuccess,
    onFailure,
    disabled = false,
    status,
    setStatus,
}: SpeakingChallengeProps) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognizedText, setRecognizedText] = useState("");
    const [recognition, setRecognition] = useState<any>(null);
    const [isSupported, setIsSupported] = useState(true);
    const [attempts, setAttempts] = useState(0);
    const [confidence, setConfidence] = useState(0);

    const resetForRetry = () => {
        setRecognizedText("");
        setIsListening(false);
        setIsProcessing(false);
        setConfidence(0);
    };

    useEffect(() => {
        if (status === "correct") {
            setAttempts(0);
            setConfidence(0);
        }
    }, [status]);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            return;
        }

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        const primaryAnswer = expectedAnswer.split("|")[0];
        recognitionInstance.lang = detectLanguage(primaryAnswer);
        
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = detectLanguage(expectedAnswer);
        
        recognitionInstance.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            const confidenceScore = event.results[0][0].confidence;
            setRecognizedText(transcript);
            setConfidence(confidenceScore);
            verifyAnswer(transcript, confidenceScore);
        };
        
        recognitionInstance.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
            setIsProcessing(false);
            
            if (event.error === 'not-allowed') {
                alert("Please allow microphone access to use speaking practice.");
            } else if (event.error === 'no-speech') {
                alert("No speech detected. Please try again.");
            }
        };
        
        recognitionInstance.onend = () => {
            setIsListening(false);
            setIsProcessing(false);
        };
        
        setRecognition(recognitionInstance);
        
        return () => {
            if (recognitionInstance) {
                recognitionInstance.abort();
            }
        };
    }, []);

    const speakText = (text: string) => {
        if (!('speechSynthesis' in window)) return;
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        utterance.rate = 0.8;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };
    
        const isAnswerCorrect = (spoken: string, expected: string): boolean => {
    const lang = detectLanguage(expected.split("|")[0]);
    
    let normalizedSpoken: string;
    let normalizedExpected: string;
    
    if (lang === "ja-JP") {
        normalizedSpoken = sanitizeJapanese(spoken);
        normalizedExpected = sanitizeJapanese(expected);
    } else {
        // For English and other languages, just lowercase and strip punctuation
        normalizedSpoken = spoken.trim().toLowerCase().replace(/[.,!?;:'"]/g, '');
        normalizedExpected = expected.trim().toLowerCase().replace(/[.,!?;:'"]/g, '');
    }
    
    if (normalizedSpoken === normalizedExpected) return true;
    if (normalizedSpoken.includes(normalizedExpected) || 
        normalizedExpected.includes(normalizedSpoken)) return true;
    
    const distance = levenshteinDistance(normalizedSpoken, normalizedExpected);
    const maxLength = Math.max(normalizedSpoken.length, normalizedExpected.length);
    const similarity = maxLength > 0 ? (1 - distance / maxLength) : 0;
    
    return similarity >= 0.85;
};

    const verifyAnswer = (spokenText: string, confidenceScore: number) => {
        console.log("=== VERIFY ANSWER START ===");
        console.log("Spoken text:", `"${spokenText}"`);
        console.log("Expected answer:", `"${expectedAnswer}"`);
        
        setIsProcessing(true);
        
        //const hasGoodConfidence = confidenceScore >= 0.6;
        const expectedAnswers = expectedAnswer.split("|");
        const isCorrect = expectedAnswers.some(answer => 
            isAnswerCorrect(spokenText, answer)
        );
        console.log("Is answer correct:", isCorrect);
        
        // Combine conditions
        const finalResult = isCorrect;
        console.log("Final result (correct && confidence):", finalResult);
        
        if (finalResult) {
            console.log("🎉 SETTING STATUS TO CORRECT");
            setStatus("correct");
            setTimeout(() => {
                onSuccess();
            }, 100);
        } else {
            console.log("❌ SETTING STATUS TO WRONG");
            setAttempts(prev => prev + 1);
            setStatus("wrong");
            onFailure();
            setTimeout(() => {
                resetForRetry();
            }, 1500);
        }
        setIsProcessing(false);
    };

    const startListening = () => {
        if (!recognition || disabled || status !== "none") return;
        
        setRecognizedText("");
        setConfidence(0);
        
        try {
            recognition.start();
            setIsListening(true);
        } catch (error) {
            console.error("Failed to start recognition:", error);
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

    const playExample = () => {
        const firstAnswer = expectedAnswer.split("|")[0];
        speakText(firstAnswer);
    };

    if (!isSupported) {
        return (
            <div className="text-center p-8 bg-amber-50 rounded-xl">
                <p className="text-amber-600">
                    Speech recognition is not supported in your browser. 
                    Please try Chrome, Edge, or Safari.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <p className="text-lg text-neutral-600 mb-4">
                    {questionText}
                </p>
                <Button
                    onClick={playExample}
                    variant="outline"
                    size="sm"
                    className="mb-4"
                    disabled={disabled || status !== "none"}
                >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Listen to Example
                </Button>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <Button
                        onClick={isListening ? stopListening : startListening}
                        variant={isListening ? "destructive" : "default"}
                        size="lg"
                        className={cn(
                            "rounded-full h-24 w-24 transition-all",
                            isListening && "animate-pulse",
                            status === "correct" && "bg-green-500 hover:bg-green-600",
                            status === "wrong" && "bg-red-500 hover:bg-red-600"
                        )}
                        disabled={disabled || status !== "none" || isProcessing}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                        ) : isListening ? (
                            <MicOff className="h-8 w-8" />
                        ) : status === "correct" ? (
                            <CheckCircle className="h-8 w-8" />
                        ) : status === "wrong" ? (
                            <XCircle className="h-8 w-8" />
                        ) : (
                            <Mic className="h-8 w-8" />
                        )}
                    </Button>
                    
                    {isListening && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <span className="text-sm text-red-500 animate-pulse">
                                Listening... Speak now
                            </span>
                        </div>
                    )}
                </div>

                {recognizedText && status !== "none" && (
                    <div className={cn(
                        "p-3 rounded-lg text-sm text-center max-w-full",
                        status === "correct" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                        <p className="font-medium">You said:</p>
                        <p className="text-base mt-1">"{recognizedText}"</p>
                        {status === "wrong" && confidence > 0 && (
                            <p className="text-xs text-neutral-500 mt-1">
                                Confidence: {Math.round(confidence * 100)}%
                            </p>
                        )}
                        {status === "wrong" && (
                            <p className="mt-2 text-sm text-amber-600">
                                Expected: {expectedAnswer.split("|").join(" or ")}
                            </p>
                        )}
                    </div>
                )}

                {status === "none" && !isListening && !isProcessing && (
                    <p className="text-sm text-neutral-500 mt-4">
                        Click the microphone and speak clearly
                    </p>
                )}

                {attempts > 0 && status === "wrong" && attempts < 3 && (
                    <p className="text-sm text-amber-600 mt-2">
                        Try again! Click the microphone to practice
                    </p>
                )}
            </div>
        </div>
    );
};