
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, ListChecks } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    description: "Sigue tu progreso para un mejor tú.",
    addHabit: "Agregar Hábito",
    addNewHabit: "Agregar Nuevo Hábito",
    name: "Nombre",
    placeholder: "Ej: Meditar por 5 minutos",
    cancel: "Cancelar",
    add: "Agregar",
    noHabitsTitle: "Sin Hábitos",
    noHabitsDescription: "No hay hábitos registrados para este día. ¡Agrega uno para empezar!",
  },
  en: {
    description: "Track your progress for a better you.",
    addHabit: "Add Habit",
    addNewHabit: "Add New Habit",
    name: "Name",
    placeholder: "E.g.: Meditate for 5 minutes",
    cancel: "Cancel",
    add: "Add",
    noHabitsTitle: "No Habits Yet",
    noHabitsDescription: "No habits logged for this day. Add one to get started!",
  }
};

// This is the type for the props of this component, which includes the ReactNode icon.
export interface Habit {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface HabitTrackerProps {
  title: string;
  habits: Habit[];
  onAddHabit: (newHabitName: string) => void;
  onToggleHabit: (id: string) => void;
  showEmptyState?: boolean;
}

export function HabitTracker({ title, habits, onAddHabit, onToggleHabit, showEmptyState = false }: HabitTrackerProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [newHabit, setNewHabit] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAddClick = () => {
    if (newHabit.trim()) {
      onAddHabit(newHabit);
      setNewHabit(""); // Reset input after adding
      setIsDialogOpen(false); // Close dialog
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">{title}</CardTitle>
          {!showEmptyState && <CardDescription>{t.description}</CardDescription>}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                />
              </div>
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t.cancel}
                </Button>
              </DialogClose>
              <Button type="submit" onClick={handleAddClick} disabled={!newHabit.trim()}>{t.add}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {showEmptyState ? (
           <div className="text-center py-10">
              <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t.noHabitsTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.noHabitsDescription}</p>
           </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
