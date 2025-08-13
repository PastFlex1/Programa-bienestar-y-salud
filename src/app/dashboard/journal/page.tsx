
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
import { BookHeart, History, Loader2, LockKeyhole, Trash2, Unlock, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getJournalEntries, saveJournalEntry, deleteJournalEntry, type JournalEntry } from "@/lib/firebase/journal";
import { useSession } from "@/context/session-provider";

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
    setPassword: "Fijar Contraseña (Opcional)",
    passwordPlaceholder: "Contraseña para esta entrada",
    deleteEntry: "Eliminar Entrada",
    deleteConfirmationTitle: "¿Estás seguro?",
    deleteConfirmationDescription: "Esta acción no se puede deshacer. ¿Quieres eliminar esta entrada permanentemente?",
    cancel: "Cancelar",
    delete: "Eliminar",
    deleting: "Eliminando...",
    unlockEntry: "Desbloquear Entrada",
    unlockDescription: "Esta entrada está protegida. Ingresa la contraseña para verla.",
    passwordLabel: "Contraseña",
    unlockButton: "Desbloquear",
    unlockingButton: "Desbloqueando...",
    wrongPassword: "La contraseña es incorrecta.",
    entryUnlocked: "Entrada desbloqueada.",
    entryLocked: "Entrada protegida por contraseña.",
    loading: "Cargando historial...",
    notLoggedInTitle: "Diario no disponible",
    notLoggedInDescription: "Inicia sesión para escribir y ver tus entradas."
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
    setPassword: "Set Password (Optional)",
    passwordPlaceholder: "Password for this entry",
    deleteEntry: "Delete Entry",
deleteConfirmationTitle: "Are you sure?",
    deleteConfirmationDescription: "This action cannot be undone. Are you sure you want to permanently delete this entry?",
    cancel: "Cancel",
    delete: "Delete",
    deleting: "Deleting...",
    unlockEntry: "Unlock Entry",
    unlockDescription: "This entry is password protected. Please enter the password to view it.",
    passwordLabel: "Password",
    unlockButton: "Unlock",
    unlockingButton: "Unlocking...",
    wrongPassword: "The password is incorrect.",
    entryUnlocked: "Entry unlocked.",
    entryLocked: "Entry is password protected.",
    loading: "Loading history...",
    notLoggedInTitle: "Journal Unavailable",
    notLoggedInDescription: "Log in to write and view your entries."
  }
};


type GroupedEntries = {
  [key: string]: JournalEntry[];
};

export default function JournalPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const { session, loading: sessionLoading } = useSession();

  const [entry, setEntry] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPasswordInput, setShowPasswordInput] = React.useState(false);
  const [history, setHistory] = React.useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [entryToDelete, setEntryToDelete] = React.useState<JournalEntry | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [entryToUnlock, setEntryToUnlock] = React.useState<JournalEntry | null>(null);
  const [unlockAttempt, setUnlockAttempt] = React.useState("");
  const [isUnlocking, setIsUnlocking] = React.useState(false);

  React.useEffect(() => {
    if (sessionLoading) {
      setIsLoading(true);
      return;
    }

    if (!session) {
      setIsLoading(false);
      setHistory([]);
      return;
    }

    let isMounted = true;
    async function loadEntries() {
        setIsLoading(true);
        try {
            const entries = await getJournalEntries();
            if (isMounted) setHistory(entries);
        } catch (err) {
            console.error(err);
            if (isMounted) setHistory([]);
        }
        if (isMounted) setIsLoading(false);
    }
    loadEntries();

    return () => { isMounted = false; }
  }, [session, sessionLoading]);


  const handleSaveEntry = async () => {
    if (entry.trim() === "") {
      toast({
        variant: "destructive",
        title: t.toastEmptyError,
      });
      return;
    }

    setIsSaving(true);
    
    try {
        const newEntry = await saveJournalEntry({
          content: entry,
          ...(password && { password: password }),
        });
        
        // Add the new entry to the top of the history
        setHistory(prev => [newEntry, ...prev]);
        
        setEntry("");
        setPassword("");
        setShowPasswordInput(false);
        toast({
            title: t.toastSuccessTitle,
            description: t.toastSuccessDescription,
        });
    } catch(e) {
        console.error("Error saving entry:", e);
        toast({ variant: "destructive", title: t.toastSaveError });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeleteEntry = async () => {
      if (!entryToDelete) return;

      setIsDeleting(true);
      const originalHistory = [...history];
      
      setHistory(prev => prev.filter(e => e.id !== entryToDelete.id));
      setEntryToDelete(null);

      try {
        await deleteJournalEntry(entryToDelete.id);
        toast({ title: t.toastDeleteSuccess });
      } catch (error) {
        setHistory(originalHistory);
        toast({ variant: "destructive", title: t.toastDeleteError });
      } finally {
        setIsDeleting(false);
      }
  };

  const handleUnlockAttempt = () => {
    if (!entryToUnlock) return;

    setIsUnlocking(true);
    if (unlockAttempt === entryToUnlock.password) {
        setHistory(prev => prev.map(e => e.id === entryToUnlock.id ? { ...e, isUnlocked: true } : e));
        setEntryToUnlock(null);
        setUnlockAttempt("");
        toast({ title: t.entryUnlocked });
    } else {
        toast({ variant: "destructive", title: t.wrongPassword });
    }
    setIsUnlocking(false);
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

  if (sessionLoading) {
      return (
        <div className="flex justify-center items-center h-full p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
  }

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
            {session ? (
              <div className="space-y-4">
                <Textarea
                  placeholder={t.placeholder}
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  rows={6}
                />
                 {showPasswordInput && (
                    <Input 
                        type="password"
                        placeholder={t.passwordPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                 )}
                <div className="flex items-center gap-4">
                    <Button onClick={handleSaveEntry} disabled={isSaving || !entry.trim()}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSaving ? t.savingButton : t.saveButton}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setShowPasswordInput(!showPasswordInput)} title={t.setPassword}>
                        <LockKeyhole className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            ) : (
                <div className="text-center py-10">
                    <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">{t.notLoggedInTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t.notLoggedInDescription}</p>
                </div>
            )}
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
            ) : !session || history.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t.noEntries}</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {sortedDateKeys.map(dateKey => (
                  <AccordionItem value={dateKey} key={dateKey}>
                    <AccordionTrigger>{formatDate(new Date(dateKey))}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {groupedEntries[dateKey].map(item => (
                           <div key={item.id} className="p-3 rounded-md bg-card-foreground/5 space-y-2 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {format(new Date(item.timestamp), t.entryTimeFormat, { locale: language === 'es' ? es : undefined })}
                                        </p>
                                        {item.password && !item.isUnlocked ? (
                                             <div className="flex items-center gap-2 text-muted-foreground italic mt-2 cursor-pointer" onClick={() => setEntryToUnlock(item)}>
                                                <LockKeyhole className="h-4 w-4"/>
                                                <p>{t.entryLocked}</p>
                                            </div>
                                        ) : (
                                            <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         {item.password && item.isUnlocked && (
                                            <Button variant="ghost" size="icon" onClick={() => setHistory(prev => prev.map(e => e.id === item.id ? { ...e, isUnlocked: false } : e))}>
                                                <Unlock className="h-4 w-4"/>
                                            </Button>
                                         )}
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

    {/* Unlock Entry Dialog */}
    <Dialog open={!!entryToUnlock} onOpenChange={() => setEntryToUnlock(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t.unlockEntry}</DialogTitle>
                <DialogDescription>{t.unlockDescription}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Label htmlFor="unlock-password">{t.passwordLabel}</Label>
                <Input 
                    id="unlock-password"
                    type="password"
                    value={unlockAttempt}
                    onChange={(e) => setUnlockAttempt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isUnlocking) {
                            handleUnlockAttempt();
                        }
                    }}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="secondary" disabled={isUnlocking}>{t.cancel}</Button>
                </DialogClose>
                <Button onClick={handleUnlockAttempt} disabled={isUnlocking || !unlockAttempt}>
                    {isUnlocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUnlocking ? t.unlockingButton : t.unlockButton}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

    