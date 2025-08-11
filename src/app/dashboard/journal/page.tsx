
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/context/language-provider';
import { useUser } from '@/context/user-provider';
import { analyzeJournalEntry } from '@/ai/flows/journal-analysis-flow';
import type { JournalAnalysis, JournalEntry } from '@/ai/flows/journal-analysis-flow';
import { JournalResponse } from '@/components/journal-response';
import { Sparkles, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { saveJournalEntry, getJournalEntries } from '@/lib/firebase/journal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const translations = {
    es: {
        welcome: "Bienvenido a tu Diario",
        todayIs: "Hoy es",
        reflect: "Tómate un momento para reflexionar.",
        placeholder: "¿Qué tienes en mente?",
        analyzeButton: "Guardar y Analizar",
        analyzingButton: "Guardando y Analizando...",
        error: "Hubo un error al analizar la entrada.",
        saveError: "Hubo un error al guardar tu entrada.",
        noContent: "Por favor, escribe algo antes de analizar.",
        history: "Historial de Entradas",
        noHistory: "Aún no tienes entradas en tu diario.",
        loadingHistory: "Cargando historial..."
    },
    en: {
        welcome: "Welcome to your Journal",
        todayIs: "Today is",
        reflect: "Take a moment to reflect.",
        placeholder: "What's on your mind?",
        analyzeButton: "Save & Analyze",
        analyzingButton: "Saving & Analyzing...",
        error: "There was an error analyzing the entry.",
        saveError: "There was an error saving your entry.",
        noContent: "Please write something before analyzing.",
        history: "Entry History",
        noHistory: "You don't have any journal entries yet.",
        loadingHistory: "Loading history..."
    }
};

export default function JournalPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const { userName } = useUser();

    const [entry, setEntry] = useState("");
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const today = new Date();
    const todayFormatted = today.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    
    useEffect(() => {
        const fetchEntries = async () => {
            setIsLoadingHistory(true);
            const fetchedEntries = await getJournalEntries();
            setEntries(fetchedEntries);
            setIsLoadingHistory(false);
        };
        fetchEntries();
    }, []);

    const handleAnalyze = async () => {
        if (!entry.trim()) {
            setError(t.noContent);
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        
        const newEntryData: JournalEntry = {
            date: today.toISOString(),
            entry: entry,
        };

        try {
            // First, save the entry
            await saveJournalEntry(newEntryData);

            // Then, analyze it
            const result = await analyzeJournalEntry({ journalEntry: entry });
            setAnalysis(result);
            
            // Add new entry to the top of the list locally
            setEntries(prev => [newEntryData, ...prev]);
            setEntry(""); // Clear textarea

        } catch (e: any) {
            console.error(e);
            if (e.message.includes("save")) {
                setError(t.saveError);
            } else {
                setError(t.error);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatEntryDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.welcome}, {userName || 'User'}</CardTitle>
                        <CardDescription>
                            {t.todayIs} {todayFormatted}. {t.reflect}
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

                {analysis && !isLoading && (
                    <JournalResponse analysis={analysis} />
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <History className="h-6 w-6" />
                           {t.history}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingHistory ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : entries.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {entries.map((item) => (
                                    <AccordionItem value={item.date} key={item.date}>
                                        <AccordionTrigger>{formatEntryDate(item.date)}</AccordionTrigger>
                                        <AccordionContent className="whitespace-pre-wrap text-muted-foreground">
                                            {item.entry}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-muted-foreground">{t.noHistory}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
