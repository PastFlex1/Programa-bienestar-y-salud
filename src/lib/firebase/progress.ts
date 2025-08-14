
"use server";

import { doc, setDoc, getDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "./config";
import { startOfWeek, format, addDays } from "date-fns";

export type DayProgress = {
    minutes: number;
    habits: number;
};

export async function updateProgressData(userId: string, dateKey: string, data: Partial<DayProgress>): Promise<void> {
    if (!db || !userId) {
        console.warn("Firebase not configured or no userId, skipping progress update.");
        return;
    };
    
    try {
        const progressDocRef = doc(db, 'users', userId, 'progress', dateKey);
        await setDoc(progressDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
        throw new Error("Could not update progress data.");
    }
}

export async function getProgressDataForPastWeek(userId: string): Promise<{ [dateKey: string]: DayProgress }> {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); 
    const progressData: { [dateKey: string]: DayProgress } = {};

    const dateKeys: string[] = [];
    for(let i=0; i<7; i++) {
        const date = addDays(weekStart, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        progressData[dateKey] = { minutes: 0, habits: 0 };
        dateKeys.push(dateKey);
    }
    
    if (!db || !userId) {
        console.warn("Firebase not configured or no userId, returning empty progress data.");
        return progressData;
    }

    try {
        const progressCollectionRef = collection(db, 'users', userId, 'progress');
        
        for (const dateKey of dateKeys) {
            const docRef = doc(progressCollectionRef, dateKey);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                 const data = docSnap.data();
                 progressData[dateKey] = {
                     minutes: data.minutes || 0,
                     habits: data.habits || 0,
                 };
            }
        }
    } catch (error) {
        console.error("Error fetching progress data for the week:", error);
    }

    return progressData;
}
