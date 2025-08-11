
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
        deleteError: "No se pudo eliminar la entrada.",
        entryDate: "Fecha de Entrada",
        entryContent: "Entrada",
        actions: "Acciones"
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
        deleteError: "Could not delete the entry.",
        entryDate: "Entry Date",
        entryContent: "Entry",
        actions: "Actions"
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
        if (user) {
            setIsLoadingHistory(true);
            getJournalEntries(user.uid)
                .then(setEntries)
                .catch(() => setError("Failed to load entries."))
                .finally(() => setIsLoadingHistory(false));
        } else if (!authLoading) {
            setIsLoadingHistory(false);
        }
    }, [user, authLoading]);

    const handleSaveEntry = async () => {
        if (!user) {
            setError(t.saveError);
            return;
        }
        if (!entry.trim()) {
            setError(t.noContent);
            return;
        }

        setIsSaving(true);
        setError(null);
        
        try {
            // Pass date as an ISO string
            await saveJournalEntry(user.uid, entry, selectedDate.toISOString());
            setEntry(""); // Clear textarea
            // Re-fetch entries to show the new one
            const updatedEntries = await getJournalEntries(user.uid);
            setEntries(updatedEntries);
        } catch (e) {
            console.error("Error saving journal entry:", e);
            setError(t.saveError);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteEntry = async (entryId: string) => {
        if (!user) {
            setError(t.deleteError);
            return;
        }
        
        try {
            await deleteJournalEntry(user.uid, entryId);
            setEntries(prev => prev.filter(e => e.id !== entryId));
        } catch (e) {
            setError(t.deleteError);
        }
    };

    const formatEntryDate = (dateString: string) => {
        const date = new Date(dateString);
        const locale = language === 'es' ? es : undefined;
        return format(date, 'PPP p', { locale });
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
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveEntry} disabled={isSaving || !entry.trim() || authLoading}>
                            {isSaving ? (
                                <>
                                    <Save className="mr-2 h-4 w-4 animate-spin" />
                                    {t.savingButton}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t.saveButton}
                                </>
                            )}
                        </Button>
                    </CardFooter>
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
                       <Card>
                           <CardContent className="p-0">
                               <Table>
                                   <TableHeader>
                                       <TableRow>
                                           <TableHead>{t.entryDate}</TableHead>
                                           <TableHead>{t.entryContent}</TableHead>
                                           <TableHead className="text-right">{t.actions}</TableHead>
                                       </TableRow>
                                   </TableHeader>
                                   <TableBody>
                                       {entries.map((item) => (
                                           <TableRow key={item.id}>
                                               <TableCell className="font-medium whitespace-nowrap">{formatEntryDate(item.date)}</TableCell>
                                               <TableCell className="whitespace-pre-wrap text-muted-foreground">{item.entry}</TableCell>
                                               <TableCell className="text-right">
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
                                                         <AlertDialogAction onClick={() => handleDeleteEntry(item.id)} className={cn(buttonVariants({ variant: "destructive" }))}>
                                                           {t.delete}
                                                         </AlertDialogAction>
                                                       </AlertDialogFooter>
                                                     </AlertDialogContent>
                                                   </AlertDialog>
                                               </TableCell>
                                           </TableRow>
                                       ))}
                                   </TableBody>
                               </Table>
                           </CardContent>
                       </Card>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">{t.noHistory}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
