"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type AudioPlayerProps = {
    audioSrc: string;
    autoPlay?: boolean;
    className?: string;
};

export const AudioPlayer = ({ audioSrc, autoPlay = false, className = "" }: AudioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audioElement = new Audio(audioSrc);
        audioElement.addEventListener('ended', () => {
            setIsPlaying(false);
        });
        audioElement.addEventListener('loadstart', () => setIsLoading(true));
        audioElement.addEventListener('canplay', () => setIsLoading(false));
        setAudio(audioElement);

        if (autoPlay && audioSrc) {
            setIsPlaying(true);
        }

        return () => {
            audioElement.pause();
            audioElement.removeEventListener('ended', () => setIsPlaying(false));
            setAudio(null);
        };
    }, [audioSrc]);

    const togglePlay = () => {
        if (!audio) return;
        
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(e => console.error("Play failed:", e));
            setIsPlaying(true);
        }
    };

    if (!audioSrc) return null;

    return (
        <Button
            onClick={togglePlay}
            variant="outline"
            size="icon"
            className={`rounded-full h-10 w-10 ${className}`}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
                <VolumeX className="h-4 w-4" />
            ) : (
                <Volume2 className="h-4 w-4" />
            )}
        </Button>
    );
};
