"use client";

import * as React from "react";
import { HabitTracker } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/language-provider";
import { format } from "date-fns";
import { es } from 'date-fns/locale';

const translations = {
  es: {
    title: "Seguimiento de Hábitos",
    description: "Construye una mejor versión de ti, un día a la vez.",
    calendarTitle: "Tu Historial de Hábitos",
    calendarDescription: "Selecciona un día para ver o registrar tus hábitos.",
    selectedDay: "Hábitos para el"
  },
  en: {
    title: "Habit Tracking",
    description: "Build a better you, one day at a time.",
    calendarTitle: "Your Habit History",
    calendarDescription: "Select a day to view or log your habits.",
    selectedDay: "Habits for"
  }
};

export default function HabitsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Simulate days where habits were completed
  const completedDays = [
    new Date(new Date().setDate(new Date().getDate() - 2)),
    new Date(new Date().setDate(new Date().getDate() - 3)),
    new Date(new Date().setDate(new Date().getDate() - 5)),
    new Date(new Date().setDate(new Date().getDate() - 6)),
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date(new Date().setDate(new Date().getDate() - 10)),
  ];

  const formatDate = (date: Date) => {
    if (language === 'es') {
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    }
    return format(date, "MMMM d, yyyy");
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{t.calendarTitle}</CardTitle>
                    <CardDescription>{t.calendarDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border p-0"
                        modifiers={{ completed: completedDays }}
                        modifiersStyles={{
                           completed: { 
                             border: "2px solid hsl(var(--primary))",
                             borderRadius: 'var(--radius)',
                           }
                        }}
                     />
                </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <HabitTracker 
              selectedDate={date} 
              title={`${t.selectedDay} ${date ? formatDate(date) : ''}`} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
