"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BellRing } from "lucide-react";
import { useLanguage } from "@/context/language-provider";


const translations = {
  es: {
    title: "Recordatorios Diarios",
    description: "Mantente constante con suaves empujones.",
    meditationReminder: "Meditar Diariamente",
    habitsReminder: "Seguimiento de Hábitos"
  },
  en: {
    title: "Daily Reminders",
    description: "Stay consistent with gentle nudges.",
    meditationReminder: "Daily Meditation",
    habitsReminder: "Habit Tracking"
  }
};

export function Reminders() {
  const [meditationReminder, setMeditationReminder] = useState(true);
  const [habitsReminder, setHabitsReminder] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BellRing className="w-6 h-6 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-md transition-colors hover:bg-accent/50">
          <Label htmlFor="meditation-reminder" className="font-medium text-sm flex-1 cursor-pointer">{t.meditationReminder}</Label>
          <Switch 
            id="meditation-reminder" 
            checked={meditationReminder}
            onCheckedChange={setMeditationReminder}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-md transition-colors hover:bg-accent/50">
          <Label htmlFor="habits-reminder" className="font-medium text-sm flex-1 cursor-pointer">{t.habitsReminder}</Label>
          <Switch 
            id="habits-reminder" 
            checked={habitsReminder}
            onCheckedChange={setHabitsReminder}
          />
        </div>
      </CardContent>
    </Card>
  )
}
