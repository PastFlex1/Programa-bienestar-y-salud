"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Coffee, Droplets, Footprints, Plus, Brain, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialHabits = [
  { id: "hydrate", label: "Hidratarse (8 vasos)", icon: <Droplets className="h-5 w-5 text-primary" />, completed: false },
  { id: "walk", label: "Caminata Matutina", icon: <Footprints className="h-5 w-5 text-primary" />, completed: true },
  { id: "mindful", label: "Momento de Atención Plena", icon: <Brain className="h-5 w-5 text-primary" />, completed: false },
  { id: "read", label: "Leer 10 páginas", icon: <BookOpen className="h-5 w-5 text-primary" />, completed: false },
];

export function HabitTracker() {
  const [habits, setHabits] = React.useState(initialHabits);
  const [newHabit, setNewHabit] = React.useState("");

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
            Hábitos Diarios
          </CardTitle>
          <CardDescription>Sigue tu progreso para un mejor tú.</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Agregar Hábito</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Hábito</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="habit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="habit-name"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  className="col-span-3"
                  placeholder="Ej: Meditar por 5 minutos"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <DialogClose asChild>
                 <Button type="submit" onClick={handleAddHabit}>Agregar</Button>
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
