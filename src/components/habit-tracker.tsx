
"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, LogIn } from "lucide-react";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    noHabitsTitle: "Sin Hábitos",
    noHabitsDescription: "No hay hábitos registrados para este día. ¡Agrega uno para empezar!",
    notLoggedIn: "Inicia sesión para ver y registrar tus hábitos."
  },
  en: {
    noHabitsTitle: "No Habits Yet",
    noHabitsDescription: "No habits logged for this day. Add one to get started!",
    notLoggedIn: "Log in to see and track your habits."
  }
};

export interface Habit {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  isInteractive: boolean;
}

export function HabitTracker({ habits, onToggleHabit, isInteractive }: HabitTrackerProps) {
  const { language } = useLanguage();
  const t = translations[language];
  
  if (!isInteractive) {
    return (
      <div className="text-center py-10">
        <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{t.notLoggedIn}</h3>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-10">
        <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{t.noHabitsTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t.noHabitsDescription}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-card-foreground/5"
        >
          <Checkbox
            id={habit.id}
            checked={habit.completed}
            onCheckedChange={() => onToggleHabit(habit.id)}
            className="h-5 w-5"
          />
          <div className="flex-1 flex items-center gap-3">
            {habit.icon}
            <label
              htmlFor={habit.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {habit.label}
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
