
"use client";

import { z } from "zod";

const HabitSchema = z.object({
  id: z.string(),
  label: z.string(),
  completed: z.boolean(),
});

export type Habit = z.infer<typeof HabitSchema>;

const HabitsDataSchema = z.record(z.array(HabitSchema)); // { "yyyy-MM-dd": Habit[] }

const STORAGE_KEY = "zenith-local-habits";

function getAllHabits(): z.infer<typeof HabitsDataSchema> {
    if (typeof window === "undefined") return {};
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) return {};
        return HabitsDataSchema.parse(JSON.parse(storedData));
    } catch (error) {
        console.error("Failed to parse habits from localStorage:", error);
        return {}; // Return empty object on error
    }
}

export function getHabitsForDate(dateKey: string): Habit[] {
    const allHabits = getAllHabits();
    return allHabits[dateKey] ?? [];
}

export function updateHabitsForDate(dateKey: string, habits: Habit[]): void {
    if (typeof window === "undefined") return;
    const allHabits = getAllHabits();
    const updatedData = { ...allHabits, [dateKey]: habits };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
        console.error(`Failed to save habits for ${dateKey} to localStorage:`, error);
    }
}
