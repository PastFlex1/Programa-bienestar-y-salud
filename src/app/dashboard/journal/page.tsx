
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/context/language-provider';
import { useUser } from '@/context/user-provider';
import { analyzeJournalEntry } from '@/ai/flows/journal-analysis-flow';
import type { JournalAnalysis } from '@/ai/flows/journal-analysis-flow';
import { JournalResponse } from '@/components/journal-response';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const translations = {
    es: {
        welcome: "Bienvenido a tu Diario",
        todayIs: "Hoy es",
        reflect: "Tómate un momento para reflexionar.",
        placeholder: "¿Qué tienes en mente?",
        analyzeButton: "Analizar con IA",
        analyzingButton: "Analizando...",
        error: "Hubo un error al analizar la entrada.",
        noContent: "Por favor, escribe algo antes de analizar."
    },
    en: {
        welcome: "Welcome to your Journal",
        todayIs: "Today is",
        reflect: "Take a moment to reflect.",
        placeholder: "What's on your mind?",
        analyzeButton: "Analyze with AI",
        analyzingButton: "Analyzing...",
        error: "There was an error analyzing the entry.",
        noContent: "Please write something before analyzing."
    }
};

export default function JournalPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const { userName } = useUser();

    const [entry, setEntry] = useState("");
    const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const today = new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleAnalyze = async () => {
        if (!entry.trim()) {
            setError(t.noContent);
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await analyzeJournalEntry({ journalEntry: entry });
            setAnalysis(result);
        } catch (e) {
            console.error(e);
            setError(t.error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.welcome}, {userName || 'User'}</CardTitle>
                        <CardDescription>
                            {t.todayIs} {today}. {t.reflect}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea 
                            placeholder={t.placeholder}
                            rows={10}
                            className="resize-none"
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                        />
                        <Button onClick={handleAnalyze} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                    {t.analyzingButton}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {t.analyzeButton}
                                </>
                            )}
                        </Button>
                         {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                </Card>

                {isLoading && (
                    <Card>
                        <CardContent className="p-6 space-y-4">
                           <Skeleton className="h-6 w-1/3" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-3/4" />
                           <br/>
                           <Skeleton className="h-6 w-1/3" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                    </Card>
                )}

                {analysis && (
                    <JournalResponse analysis={analysis} />
                )}
            </div>
        </div>
    );
}
