"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Coffee, Droplets, Footprints } from "lucide-react";

const habits = [
  { id: "hydrate", label: "Hydrate (8 glasses)", icon: <Droplets className="h-5 w-5 text-primary" /> },
  { id: "walk", label: "Morning Walk", icon: <Footprints className="h-5 w-5 text-primary" /> },
  { id: "mindful", label: "Mindful Moment", icon: <Coffee className="h-5 w-5 text-primary" /> },
];

export function HabitTracker() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          Daily Habits
        </CardTitle>
        <CardDescription>Track your progress for a better you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-accent">
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
