
"use client";

import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume1, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/context/language-provider";

const translations = {
    es: {
        volume: "Volumen",
    },
    en: {
        volume: "Volume",
    }
}

interface MeditationPlayerProps {
    title: string;
    lengthMinutes: number;
}

export function MeditationPlayer({ title, lengthMinutes }: MeditationPlayerProps) {
    const { language } = useLanguage();
    const t = translations[language];

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(50);
    const totalSeconds = lengthMinutes * 60;

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPlaying && progress < totalSeconds) {
            interval = setInterval(() => {
                setProgress(prev => prev + 1);
            }, 1000);
        } else if (progress >= totalSeconds) {
            setIsPlaying(false);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPlaying, progress, totalSeconds]);


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const getVolumeIcon = () => {
        if (volume === 0) return <VolumeX className="h-5 w-5" />;
        if (volume < 50) return <Volume1 className="h-5 w-5" />;
        return <Volume2 className="h-5 w-5" />;
    }

    return (
        <div className="p-4 space-y-6">
            <DialogHeader className="text-center">
                <DialogTitle className="text-2xl font-headline">{title}</DialogTitle>
                <DialogDescription>{formatTime(progress)} / {formatTime(totalSeconds)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <Slider
                    value={[progress]}
                    onValueChange={(value) => setProgress(value[0])}
                    max={totalSeconds}
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
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                        max={100}
                        step={1}
                    />
                </div>
            </div>
        </div>
    );
}
