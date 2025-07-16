"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Coffee, Droplets, Footprints, Plus } from "lucide-react";

const habits = [
  { id: "hydrate", label: "Hidratarse (8 vasos)", icon: <Droplets className="h-5 w-5 text-primary" /> },
  { id: "walk", label: "Caminata Matutina", icon: <Footprints className="h-5 w-5 text-primary" /> },
  { id: "mindful", label: "Momento de Atención Plena", icon: <Coffee className="h-5 w-5 text-primary" /> },
];

export function HabitTracker() {
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
        <Button size="icon" variant="outline">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Agregar Hábito</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-card-foreground/5">
              <Checkbox id={habit.id} className="h-5 w-5" />
              <div className="flex-1 flex items-center gap-3">
                {habit.icon}
                <label
                  htmlFor={habit.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
