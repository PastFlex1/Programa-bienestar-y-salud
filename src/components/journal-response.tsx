
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, BookCheck, BrainCircuit } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import type { JournalAnalysis } from "@/ai/flows/journal-analysis-flow";

const translations = {
    es: {
        analysisTitle: "Análisis de tu Entrada",
        summary: "Resumen",
        analysis: "Análisis",
        advice: "Consejo Práctico"
    },
    en: {
        analysisTitle: "Your Entry's Analysis",
        summary: "Summary",
        analysis: "Analysis",
        advice: "Practical Advice"
    }
};

interface JournalResponseProps {
    analysis: JournalAnalysis;
}

export function JournalResponse({ analysis }: JournalResponseProps) {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline">{t.analysisTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                        <BookCheck className="h-5 w-5 text-primary" />
                        {t.summary}
                    </h3>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        {t.analysis}
                    </h3>
                    <p className="text-muted-foreground">{analysis.analysis}</p>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        {t.advice}
                    </h3>
                    <p className="text-muted-foreground">{analysis.advice}</p>
                </div>
            </CardContent>
        </Card>
    );
}
