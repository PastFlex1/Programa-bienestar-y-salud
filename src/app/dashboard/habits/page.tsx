"use client";

import * as React from "react";
import { Habit, HabitTracker } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/language-provider";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Droplets, Footprints, Brain, BookOpen, CheckCircle2 } from "lucide-react";

const translations = {
  es: {
    title: "Seguimiento de Hábitos",
    description: "Construye una mejor versión de ti, un día a la vez.",
    calendarTitle: "Tu Historial de Hábitos",
    calendarDescription: "Selecciona un día para ver tus hábitos.",
    selectedDay: "Hábitos para el",
    initialHabits: {
      hydrate: "Hidratarse (8 vasos)",
      walk: "Caminata Matutina",
      mindful: "Momento de Atención Plena",
      read: "Leer 10 páginas",
    }
  },
  en: {
    title: "Habit Tracking",
    description: "Build a better you, one day at a time.",
    calendarTitle: "Your Habit History",
    calendarDescription: "Select a day to view your habits.",
    selectedDay: "Habits for",
    initialHabits: {
      hydrate: "Hydrate (8 glasses)",
      walk: "Morning Walk",
      mindful: "Mindful Moment",
      read: "Read 10 pages",
    }
  }
};

export default function HabitsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [completedDays, setCompletedDays] = React.useState<Date[]>([]);
  
  const initialHabits = React.useMemo<Habit[]>(() => [
    { id: "hydrate", label: t.initialHabits.hydrate, icon: <Droplets className="h-5 w-5 text-primary" />, completed: false },
    { id: "walk", label: t.initialHabits.walk, icon: <Footprints className="h-5 w-5 text-primary" />, completed: true },
    { id: "mindful", label: t.initialHabits.mindful, icon: <Brain className="h-5 w-5 text-primary" />, completed: false },
    { id: "read", label: t.initialHabits.read, icon: <BookOpen className="h-5 w-5 text-primary" />, completed: false },
  ], [t]);

  const [habits, setHabits] = React.useState<Habit[]>(initialHabits);

  React.useEffect(() => {
    // Here you would typically fetch habits for the selectedDate
    // For now, we just reset to the initial list for demonstration
    setHabits(initialHabits);
  }, [date, initialHabits]);

  const handleAddHabit = (newHabitName: string) => {
    if (newHabitName.trim() === "") return;
    const newHabitObject: Habit = {
      id: `custom-${Date.now()}`,
      label: newHabitName,
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      completed: true, // Mark as completed on creation
    };
    setHabits([...habits, newHabitObject]);

    // Mark the current day as completed
    if (date) {
      const isAlreadyCompleted = completedDays.some(
        (d) => d.toDateString() === date.toDateString()
      );
      if (!isAlreadyCompleted) {
        setCompletedDays([...completedDays, date]);
      }
    }
  };

  const handleToggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };
  
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
              title={`${t.selectedDay} ${date ? formatDate(date) : ''}`} 
              habits={habits}
              onAddHabit={handleAddHabit}
              onToggleHabit={handleToggleHabit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
