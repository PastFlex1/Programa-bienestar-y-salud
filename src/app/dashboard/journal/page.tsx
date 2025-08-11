
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/context/language-provider';
import { useUser } from '@/context/user-provider';
import { History, Calendar as CalendarIcon, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { saveJournalEntry, getJournalEntries, JournalEntry } from '@/lib/firebase/journal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';


const translations = {
    es: {
        welcome: "Bienvenido a tu Diario",
        selectedDate: "Entrada para el",
        reflect: "Tómate un momento para reflexionar.",
        placeholder: "¿Qué tienes en mente?",
        saveButton: "Guardar Entrada",
        savingButton: "Guardando...",
        saveError: "Hubo un error al guardar tu entrada.",
        noContent: "Por favor, escribe algo antes de guardar.",
        history: "Historial de Entradas",
        noHistory: "Aún no tienes entradas en tu diario.",
        loadingHistory: "Cargando historial...",
        selectDate: "Selecciona una fecha"
    },
    en: {
        welcome: "Welcome to your Journal",
        selectedDate: "Entry for",
        reflect: "Take a moment to reflect.",
        placeholder: "What's on your mind?",
        saveButton: "Save Entry",
        savingButton: "Saving...",
        saveError: "There was an error saving your entry.",
        noContent: "Please write something before saving.",
        history: "Entry History",
        noHistory: "You don't have any journal entries yet.",
        loadingHistory: "Loading history...",
        selectDate: "Select a date"
    }
};

export default function JournalPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const { userName } = useUser();

    const [entry, setEntry] = useState("");
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const selectedDateFormatted = selectedDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
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

    const handleSaveEntry = async () => {
        if (!entry.trim()) {
            setError(t.noContent);
            return;
        }

        setIsSaving(true);
        setError(null);
        
        const newEntryData: JournalEntry = {
            date: selectedDate.toISOString(),
            entry: entry,
        };

        try {
            await saveJournalEntry(newEntryData);
            
            // Add new entry to the top of the list locally
            setEntries(prev => [newEntryData, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setEntry(""); // Clear textarea

        } catch (e: any) {
            console.error(e);
            setError(t.saveError);
        } finally {
            setIsSaving(false);
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
                             {t.selectedDate} {selectedDateFormatted}. {t.reflect}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Textarea 
                                placeholder={t.placeholder}
                                rows={10}
                                className="resize-none flex-1"
                                value={entry}
                                onChange={(e) => setEntry(e.target.value)}
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full sm:w-[280px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        format(selectedDate, 'PPP', { locale: language === 'es' ? es : undefined })
                                    ) : (
                                        <span>{t.selectDate}</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button onClick={handleSaveEntry} disabled={isSaving || !entry.trim()}>
                            {isSaving ? (
                                <>
                                    <Save className="mr-2 h-4 w-4 animate-pulse" />
                                    {t.savingButton}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t.saveButton}
                                </>
                            )}
                        </Button>
                         {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                </Card>

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
