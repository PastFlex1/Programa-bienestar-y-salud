
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
import { BookHeart, History, Loader2 } from "lucide-react";

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
    toastErrorTitle: "Error",
    toastErrorDescription: "La entrada no puede estar vacía.",
    entryTimeFormat: "p",
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
    toastErrorTitle: "Error",
    toastErrorDescription: "Entry cannot be empty.",
    entryTimeFormat: "p",
  }
};

type JournalEntry = {
  id: number;
  content: string;
  timestamp: Date;
};

type GroupedEntries = {
  [key: string]: JournalEntry[];
};

export default function JournalPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();

  const [entry, setEntry] = React.useState("");
  const [history, setHistory] = React.useState<JournalEntry[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveEntry = () => {
    if (entry.trim() === "") {
      toast({
        variant: "destructive",
        title: t.toastErrorTitle,
        description: t.toastErrorDescription,
      });
      return;
    }

    setIsSaving(true);
    const newEntry: JournalEntry = {
      id: Date.now(),
      content: entry,
      timestamp: new Date(),
    };

    // Simulate async operation
    setTimeout(() => {
      setHistory(prev => [newEntry, ...prev]);
      setEntry("");
      setIsSaving(false);
      toast({
        title: t.toastSuccessTitle,
        description: t.toastSuccessDescription,
      });
    }, 500);
  };
  
  const formatDate = (d: Date) => language === 'es'
    ? format(d, "d 'de' MMMM 'de' yyyy", { locale: es })
    : format(d, "MMMM d, yyyy");

  const groupedEntries = React.useMemo(() => {
    return history.reduce((acc: GroupedEntries, currentEntry) => {
      const dateKey = format(currentEntry.timestamp, "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(currentEntry);
      return acc;
    }, {});
  }, [history]);

  const sortedDateKeys = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));


  return (
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
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t.placeholder}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              rows={6}
            />
            <Button onClick={handleSaveEntry} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? t.savingButton : t.saveButton}
            </Button>
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
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t.noEntries}</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {sortedDateKeys.map(dateKey => (
                  <AccordionItem value={dateKey} key={dateKey}>
                    <AccordionTrigger>{formatDate(new Date(dateKey))}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {groupedEntries[dateKey].map(item => (
                           <div key={item.id} className="p-3 rounded-md bg-card-foreground/5 space-y-2">
                                <p className="text-sm text-muted-foreground font-medium">
                                    {format(item.timestamp, t.entryTimeFormat, { locale: language === 'es' ? es : undefined })}
                                </p>
                                <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
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
  );
}
