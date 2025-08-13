
"use server";

import { doc, setDoc, getDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";
import { startOfWeek, format, addDays } from "date-fns";

export type DayProgress = {
    minutes: number;
    habits: number;
};

export async function updateProgressData(dateKey: string, data: Partial<DayProgress>): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found. Cannot update progress data.");
        return;
    };
    
    try {
        const progressDocRef = doc(db, 'users', session.uid, 'progress', dateKey);
        await setDoc(progressDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
    }
}

export async function getProgressDataForPastWeek(): Promise<{ [dateKey: string]: DayProgress }> {
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
    
    const session = await getSession();
    if (!session?.uid) {
        return progressData;
    }

    try {
        const progressCollectionRef = collection(db, 'users', session.uid, 'progress');
        
        for (const dateKey of dateKeys) {
            const docRef = doc(progressCollectionRef, dateKey);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                 progressData[dateKey] = docSnap.data() as DayProgress;
            }
        }
    } catch (error) {
        console.error("Error fetching progress data:", error);
    }

    return progressData;
}
