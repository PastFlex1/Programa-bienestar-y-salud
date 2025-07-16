"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Droplets, Footprints, Plus, Brain, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    title: "Hábitos Diarios",
    description: "Sigue tu progreso para un mejor tú.",
    addHabit: "Agregar Hábito",
    addNewHabit: "Agregar Nuevo Hábito",
    name: "Nombre",
    placeholder: "Ej: Meditar por 5 minutos",
    cancel: "Cancelar",
    add: "Agregar",
    hydrate: "Hidratarse (8 vasos)",
    walk: "Caminata Matutina",
    mindful: "Momento de Atención Plena",
    read: "Leer 10 páginas",
  },
  en: {
    title: "Daily Habits",
    description: "Track your progress for a better you.",
    addHabit: "Add Habit",
    addNewHabit: "Add New Habit",
    name: "Name",
    placeholder: "E.g.: Meditate for 5 minutes",
    cancel: "Cancel",
    add: "Add",
    hydrate: "Hydrate (8 glasses)",
    walk: "Morning Walk",
    mindful: "Mindful Moment",
    read: "Read 10 pages",
  }
};

export function HabitTracker() {
  const { language } = useLanguage();
  const t = translations[language];

  const initialHabits = React.useMemo(() => [
    { id: "hydrate", label: t.hydrate, icon: <Droplets className="h-5 w-5 text-primary" />, completed: false },
    { id: "walk", label: t.walk, icon: <Footprints className="h-5 w-5 text-primary" />, completed: true },
    { id: "mindful", label: t.mindful, icon: <Brain className="h-5 w-5 text-primary" />, completed: false },
    { id: "read", label: t.read, icon: <BookOpen className="h-5 w-5 text-primary" />, completed: false },
  ], [t]);
  
  const [habits, setHabits] = React.useState(initialHabits);
  const [newHabit, setNewHabit] = React.useState("");

  React.useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);

  const handleToggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const handleAddHabit = () => {
    if (newHabit.trim() === "") return;
    const newHabitObject = {
      id: `custom-${Date.now()}`,
      label: newHabit,
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      completed: false,
    };
    setHabits([...habits, newHabitObject]);
    setNewHabit("");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
              <span className="sr-only">{t.addHabit}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.addNewHabit}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="habit-name" className="text-right">
                  {t.name}
                </Label>
                <Input
                  id="habit-name"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  className="col-span-3"
                  placeholder={t.placeholder}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t.cancel}
                </Button>
              </DialogClose>
              <DialogClose asChild>
                 <Button type="submit" onClick={handleAddHabit}>{t.add}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-card-foreground/5"
            >
              <Checkbox
                id={habit.id}
                checked={habit.completed}
                onCheckedChange={() => handleToggleHabit(habit.id)}
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
      </CardContent>
    </Card>
  );
}
