
"use server";

import { doc, getDoc, setDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";
import { eachDayOfInterval, format, startOfWeek, endOfWeek, addDays } from "date-fns";

export type DayProgress = {
    minutes: number;
    habits: number;
};

const getProgressCollectionRef = (userId: string) => {
    return collection(db, 'users', userId, 'progress');
}

const getProgressDocRef = (userId: string, dateKey: string) => {
    return doc(db, 'users', userId, 'progress', dateKey);
}

export async function updateProgressData(dateKey: string, data: DayProgress): Promise<void> {
    const session = await getSession();
    if (!session?.uid) return;
    
    try {
        const progressDocRef = getProgressDocRef(session.uid, dateKey);
        await setDoc(progressDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
        throw new Error("Could not update progress data.");
    }
}

export async function getProgressDataForPastWeek(): Promise<{ [dateKey: string]: DayProgress }> {
    const session = await getSession();
    if (!session?.uid) return {};

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    
    const progressData: { [dateKey: string]: DayProgress } = {};

    try {
        const progressCollection = getProgressCollectionRef(session.uid);
        const q = query(progressCollection);
        const querySnapshot = await getDocs(q);
        
        const dbData: { [key: string]: DayProgress } = {};
        querySnapshot.forEach(doc => {
            dbData[doc.id] = doc.data() as DayProgress;
        });
        
        // Initialize data for every day of the week to ensure the chart is complete
        for(let i=0; i<7; i++) {
            const date = addDays(weekStart, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            progressData[dateKey] = dbData[dateKey] || { minutes: 0, habits: 0 };
        }

    } catch (error) {
        console.error("Error fetching progress data:", error);
         // If fetching fails, initialize with empty data to prevent crashes
        for(let i=0; i<7; i++) {
            const date = addDays(weekStart, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            progressData[dateKey] = { minutes: 0, habits: 0 };
        }
    }

    return progressData;
}

    