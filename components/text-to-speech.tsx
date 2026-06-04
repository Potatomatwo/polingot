"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type TextToSpeechProps = {
    text: string;
    language?: string;
    className?: string;
};

export const TextToSpeech = ({ text, language = "ja-JP", className = "" }: TextToSpeechProps) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = () => {
        if (!('speechSynthesis' in window)) {
            console.error("Text-to-speech not supported");
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9; // Slightly slower for language learning
        utterance.pitch = 1;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
    };

    return (
        <Button
            onClick={speak}
            variant="outline"
            size="icon"
            className={`rounded-full h-10 w-10 ${className}`}
            disabled={isSpeaking}
        >
            {isSpeaking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Volume2 className="h-4 w-4" />
            )}
        </Button>
    );
};
