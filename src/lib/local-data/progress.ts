
"use client";

import { z } from "zod";
import { startOfWeek, format, addDays } from "date-fns";

const DayProgressSchema = z.object({
    minutes: z.number(),
    habits: z.number(),
});

export type DayProgress = z.infer<typeof DayProgressSchema>;

const ProgressDataSchema = z.record(DayProgressSchema); // { "yyyy-MM-dd": DayProgress }

const STORAGE_KEY_PREFIX = "zenith-local-progress-";

function getAllProgressData(userId: string): z.infer<typeof ProgressDataSchema> {
    if (typeof window === 'undefined') return {};
    try {
        const storedData = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
        return storedData ? ProgressDataSchema.parse(JSON.parse(storedData)) : {};
    } catch (error) {
        console.error("Failed to parse progress data from localStorage:", error);
        return {};
    }
}

export function updateProgressData(userId: string, dateKey: string, data: DayProgress): void {
    if (typeof window === 'undefined') return;
    const allData = getAllProgressData(userId);
    allData[dateKey] = data;
    try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(allData));
    } catch (error) {
        console.error(`Error saving progress for ${dateKey} to localStorage:`, error);
    }
}

export function getProgressDataForPastWeek(userId: string): { [dateKey: string]: DayProgress } {
    const allProgress = getAllProgressData(userId);
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const progressData: { [dateKey: string]: DayProgress } = {};

    for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        progressData[dateKey] = allProgress[dateKey] || { minutes: 0, habits: 0 };
    }
    
    return progressData;
}
