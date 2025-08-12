
"use server";

import { ref, get, set, child, update } from "firebase/database";
import { db } from "./config";
import { getSession } from "./auth";
import { eachDayOfInterval, format, startOfWeek, subDays } from "date-fns";

export type DayProgress = {
    minutes: number;
    habits: number;
};

const getProgressRef = (userId: string) => {
    return ref(db, `users/${userId}/progress`);
}

export async function updateProgressData(dateKey: string, data: DayProgress): Promise<void> {
    const session = await getSession();
    if (!session) return;
    
    try {
        const progressRef = getProgressRef(session.uid);
        const dateRef = child(progressRef, dateKey);
        await set(dateRef, data);
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
    }
}

export async function getProgressDataForPastWeek(): Promise<{ [dateKey: string]: DayProgress }> {
    const session = await getSession();
    if (!session) return {};

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const dates = eachDayOfInterval({ start: weekStart, end: today });

    const promises = dates.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dateRef = child(getProgressRef(session.uid), dateKey);
        return get(dateRef).then(snapshot => ({ dateKey, snapshot }));
    });

    const results = await Promise.all(promises);
    const progressData: { [dateKey: string]: DayProgress } = {};

    results.forEach(({ dateKey, snapshot }) => {
        if (snapshot.exists()) {
            progressData[dateKey] = snapshot.val();
        } else {
            progressData[dateKey] = { minutes: 0, habits: 0 };
        }
    });

    return progressData;
}
