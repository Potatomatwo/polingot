"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SpeechInputProps = {
    onResult: (text: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    language?: string;
    disabled?: boolean;
    className?: string;
};

export const SpeechInput = ({ 
    onResult, 
    onStart, 
    onEnd, 
    language = "ja-JP", 
    disabled = false,
    className = ""
}: SpeechInputProps) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            toast.error("Speech recognition is not supported in your browser");
            return;
        }

        // @ts-ignore - Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = language;
        
        recognitionInstance.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
            onEnd?.();
        };
        
        recognitionInstance.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed') {
                toast.error("Please allow microphone access to use speech input");
            } else if (event.error === 'no-speech') {
                toast.error("No speech detected. Please try again.");
            } else {
                toast.error(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
            onEnd?.();
        };
        
        recognitionInstance.onend = () => {
            setIsListening(false);
            onEnd?.();
        };
        
        setRecognition(recognitionInstance);
        
        return () => {
            if (recognitionInstance) {
                recognitionInstance.abort();
            }
        };
    }, [language]);

    const startListening = () => {
        if (!recognition || disabled) return;
        
        try {
            recognition.start();
            setIsListening(true);
            onStart?.();
        } catch (error) {
            console.error("Failed to start recognition:", error);
            toast.error("Failed to start speech recognition");
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

    if (!isSupported) return null;

    return (
        <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "default" : "outline"}
            size="icon"
            className={`rounded-full h-10 w-10 ${isListening ? "bg-red-500 hover:bg-red-600" : ""} ${className}`}
            disabled={disabled}
        >
            {isListening ? (
                <Loader2 className="h-4 w-4 animate-pulse" />
            ) : (
                <Mic className="h-4 w-4" />
            )}
        </Button>
    );
};
