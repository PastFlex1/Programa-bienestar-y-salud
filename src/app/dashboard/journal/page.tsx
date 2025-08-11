
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/context/language-provider';
import { useUser } from '@/context/user-provider';
import { useAuth } from '@/context/auth-provider';
import { History, Calendar as CalendarIcon, Save, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { saveJournalEntry, getJournalEntries, JournalEntry, deleteJournalEntry } from '@/lib/firebase/journal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
        selectDate: "Selecciona una fecha",
        deleteConfirmTitle: "¿Estás seguro?",
        deleteConfirmDesc: "Esta acción no se puede deshacer. Esto eliminará permanentemente tu entrada del diario.",
        cancel: "Cancelar",
        delete: "Eliminar",
        deleteError: "No se pudo eliminar la entrada."
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
        selectDate: "Select a date",
        deleteConfirmTitle: "Are you sure?",
        deleteConfirmDesc: "This action cannot be undone. This will permanently delete your journal entry.",
        cancel: "Cancel",
        delete: "Delete",
        deleteError: "Could not delete the entry."
    }
};

export default function JournalPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const { userName } = useUser();
    const { user, loading: authLoading } = useAuth();

    const [entry, setEntry] = useState("");
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        if (!user && !authLoading) {
            setIsLoadingHistory(false);
            return;
        }
        if (user) {
            setIsLoadingHistory(true);
            getJournalEntries(user.uid)
                .then(setEntries)
                .finally(() => setIsLoadingHistory(false));
        }
    }, [user, authLoading]);

    const handleSaveEntry = async () => {
        if (!entry.trim()) {
            setError(t.noContent);
            return;
        }
        if (!user) {
            setError(t.saveError);
            return;
        }

        setIsSaving(true);
        setError(null);
        
        const newEntryData: JournalEntry = {
            date: selectedDate.toISOString(),
            entry: entry,
        };

        try {
            await saveJournalEntry(newEntryData, user.uid);
            setEntries(prev => [newEntryData, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setEntry(""); 
        } catch (e) {
            setError(t.saveError);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteEntry = async (entryToDelete: JournalEntry) => {
        if (!user) {
            setError(t.deleteError);
            return;
        }
        
        try {
            await deleteJournalEntry(entryToDelete, user.uid);
            setEntries(prev => prev.filter(e => e.date !== entryToDelete.date));
        } catch (e) {
            setError(t.deleteError);
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
                         <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                {t.selectedDate} {format(selectedDate, 'PPP', { locale: language === 'es' ? es : undefined })}. {t.reflect}
                            </span>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <CalendarIcon className="h-5 w-5" />
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea 
                            placeholder={t.placeholder}
                            rows={8}
                            className="resize-none flex-1"
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                        />
                        <Button onClick={handleSaveEntry} disabled={isSaving || !entry.trim() || authLoading}>
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

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                       <History className="h-6 w-6" />
                       {t.history}
                    </h2>
                     {isLoadingHistory ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : entries.length > 0 ? (
                        entries.map((item) => (
                           <Card key={item.date}>
                               <CardHeader>
                                   <CardTitle className="text-lg">
                                       {formatEntryDate(item.date)}
                                   </CardTitle>
                               </CardHeader>
                               <CardContent className="whitespace-pre-wrap text-muted-foreground">
                                   {item.entry}
                               </CardContent>
                               <CardFooter className="flex justify-end">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {t.deleteConfirmDesc}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteEntry(item)} className={buttonVariants({ variant: "destructive" })}>
                                            {t.delete}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                               </CardFooter>
                           </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">{t.noHistory}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
