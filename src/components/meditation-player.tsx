
"use client";

import { useState, useEffect, useRef } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume1, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useProgress } from "@/context/progress-provider";

const translations = {
    es: {
        volume: "Volumen",
    },
    en: {
        volume: "Volumen",
    }
}

interface MeditationPlayerProps {
    title: string;
    lengthMinutes: number;
    audioUrl: string;
}

export function MeditationPlayer({ title, lengthMinutes, audioUrl }: MeditationPlayerProps) {
    const { language } = useLanguage();
    const t = translations[language];
    const { logMeditation } = useProgress();

    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5); // From 0 to 1
    const [duration, setDuration] = useState(lengthMinutes * 60);

    const handleAudioEnd = () => {
        setIsPlaying(false);
        logMeditation(new Date(), lengthMinutes);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            if(audio.duration && !isNaN(audio.duration)) {
                setDuration(audio.duration);
            }
        }
        
        const setAudioTime = () => setProgress(audio.currentTime);

        audio.addEventListener("loadeddata", setAudioData);
        audio.addEventListener("timeupdate", setAudioTime);

        return () => {
            audio.removeEventListener("loadeddata", setAudioData);
            audio.removeEventListener("timeupdate", setAudioTime);
        };
    }, []);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(e => console.error("Error playing audio:", e));
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
        }
    }, [volume]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handleReset = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = 0;
            setProgress(0);
        }
        setIsPlaying(true); // Auto-play on reset
    };
    
    const handleProgressChange = (value: number[]) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = value[0];
            setProgress(value[0]);
        }
    }

    const getVolumeIcon = () => {
        if (volume === 0) return <VolumeX className="h-5 w-5" />;
        if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
        return <Volume2 className="h-5 w-5" />;
    }

    return (
        <div className="p-4 space-y-6">
            <audio ref={audioRef} src={audioUrl} preload="metadata" onEnded={handleAudioEnd} />
            <DialogHeader className="text-center">
                <DialogTitle className="text-2xl font-headline">{title}</DialogTitle>
                <DialogDescription>{formatTime(progress)} / {formatTime(duration)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <Slider
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    max={duration}
                    step={1}
                />
                <div className="flex justify-center items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleReset}>
                        <RotateCcw className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                 <label className="text-sm font-medium">{t.volume}</label>
                 <div className="flex items-center gap-3">
                    {getVolumeIcon()}
                    <Slider
                        value={[volume * 100]}
                        onValueChange={(value) => setVolume(value[0] / 100)}
                        max={100}
                        step={1}
                    />
                </div>
            </div>
        </div>
    );
}
