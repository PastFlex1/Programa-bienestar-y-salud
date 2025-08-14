
"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-provider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookHeart, History, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { getJournalEntries, saveJournalEntry, deleteJournalEntry, type JournalEntry } from "@/lib/firebase/journal";
import { useAuth } from "@/context/auth-provider";

const translations = {
  es: {
    title: "Tu Diario Personal",
    description: "Un espacio para reflexionar sobre tus pensamientos y sentimientos.",
    placeholder: "¿Cómo te sientes hoy?",
    saveButton: "Guardar Entrada",
    savingButton: "Guardando...",
    historyTitle: "Historial de Entradas",
    noEntries: "Aún no tienes entradas en tu diario.",
    toastSuccessTitle: "Entrada Guardada",
    toastSuccessDescription: "Tu reflexión ha sido guardada.",
    toastSaveError: "No se pudo guardar la entrada. Inténtalo de nuevo.",
    toastEmptyError: "La entrada no puede estar vacía.",
    toastDeleteSuccess: "Entrada eliminada exitosamente.",
    toastDeleteError: "No se pudo eliminar la entrada.",
    entryTimeFormat: "p",
    deleteEntry: "Eliminar Entrada",
    deleteConfirmationTitle: "¿Estás seguro?",
    deleteConfirmationDescription: "Esta acción no se puede deshacer. ¿Quieres eliminar esta entrada permanentemente?",
    cancel: "Cancelar",
    delete: "Eliminar",
    deleting: "Eliminando...",
    loading: "Cargando historial...",
  },
  en: {
    title: "Your Personal Journal",
    description: "A space to reflect on your thoughts and feelings.",
    placeholder: "How are you feeling today?",
    saveButton: "Save Entry",
    savingButton: "Saving...",
    historyTitle: "Entry History",
    noEntries: "You don't have any journal entries yet.",
    toastSuccessTitle: "Entry Saved",
    toastSuccessDescription: "Your reflection has been saved.",
    toastSaveError: "Could not save entry. Please try again.",
    toastEmptyError: "Entry cannot be empty.",
    toastDeleteSuccess: "Entry deleted successfully.",
    toastDeleteError: "Could not delete entry.",
    entryTimeFormat: "p",
    deleteEntry: "Delete Entry",
    deleteConfirmationTitle: "Are you sure?",
    deleteConfirmationDescription: "This action cannot be undone. Are you sure you want to permanently delete this entry?",
    cancel: "Cancel",
    delete: "Delete",
    deleting: "Deleting...",
    loading: "Loading history...",
  }
};


type GroupedEntries = {
  [key: string]: JournalEntry[];
};

export default function JournalPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const { user } = useAuth();

  const [entry, setEntry] = React.useState("");
  const [history, setHistory] = React.useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [entryToDelete, setEntryToDelete] = React.useState<JournalEntry | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    getJournalEntries(user.id).then(entries => {
        setHistory(entries);
        setIsLoading(false);
    });
  }, [user]);


  const handleSaveEntry = async () => {
    if (entry.trim() === "" || !user) {
      toast({ variant: "destructive", title: t.toastEmptyError });
      return;
    }
    setIsSaving(true);
    
    try {
      const savedEntry = await saveJournalEntry(user.id, { content: entry });
      setHistory(prev => [savedEntry, ...prev]);
      setEntry("");
      toast({ title: t.toastSuccessTitle, description: t.toastSuccessDescription });
    } catch (error) {
      toast({ variant: "destructive", title: t.toastSaveError });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteEntry = async () => {
      if (!entryToDelete || !user) return;

      setIsDeleting(true);
      
      try {
        await deleteJournalEntry(user.id, entryToDelete.id);
        setHistory(prev => prev.filter(e => e.id !== entryToDelete.id));
        setEntryToDelete(null);
        toast({ title: t.toastDeleteSuccess });
      } catch (error) {
        toast({ variant: "destructive", title: t.toastDeleteError });
      } finally {
        setIsDeleting(false);
      }
  };

  const formatDate = (d: Date) => language === 'es'
    ? format(d, "d 'de' MMMM 'de' yyyy", { locale: es })
    : format(d, "MMMM d, yyyy");

  const groupedEntries = React.useMemo(() => {
    return history.reduce((acc: GroupedEntries, currentEntry) => {
      const dateKey = format(new Date(currentEntry.timestamp), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(currentEntry);
      return acc;
    }, {});
  }, [history]);

  const sortedDateKeys = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <BookHeart className="w-6 h-6 text-primary"/>
                {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder={t.placeholder}
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  rows={6}
                  disabled={isSaving}
                />
                <div className="flex items-center justify-between">
                    <Button onClick={handleSaveEntry} disabled={isSaving || !entry.trim()}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSaving ? t.savingButton : t.saveButton}
                    </Button>
                </div>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <History className="w-6 h-6 text-primary"/>
                {t.historyTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                 <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : history.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t.noEntries}</p>
            ) : (
              <Accordion type="single" collapsible className="w-full" defaultValue={sortedDateKeys[0]}>
                {sortedDateKeys.map(dateKey => (
                  <AccordionItem value={dateKey} key={dateKey}>
                    <AccordionTrigger>{formatDate(new Date(dateKey + 'T00:00:00'))}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {groupedEntries[dateKey].map(item => (
                           <div key={item.id} className="p-3 rounded-md bg-card-foreground/5 space-y-2 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {format(new Date(item.timestamp), t.entryTimeFormat, { locale: language === 'es' ? es : undefined })}
                                        </p>
                                        <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setEntryToDelete(item)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>
                           </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Delete Confirmation Dialog */}
    <Dialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t.deleteConfirmationTitle}</DialogTitle>
                <DialogDescription>{t.deleteConfirmationDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="secondary" disabled={isDeleting}>{t.cancel}</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteEntry} disabled={isDeleting}>
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isDeleting ? t.deleting : t.delete}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
