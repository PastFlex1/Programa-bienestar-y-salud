
"use server";

import { doc, getDoc, setDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";
import { eachDayOfInterval, format, startOfWeek, endOfWeek } from "date-fns";

export type DayProgress = {
    minutes: number;
    habits: number;
};

const getProgressCollectionRef = (userId: string) => {
    return collection(db, `users/${userId}/progress`);
}

export async function updateProgressData(dateKey: string, data: DayProgress): Promise<void> {
    const session = await getSession();
    if (!session?.uid) return;
    
    try {
        const progressDocRef = doc(db, `users/${session.uid}/progress/${dateKey}`);
        await setDoc(progressDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
        // Optionally re-throw or handle the error
    }
}

export async function getProgressDataForPastWeek(): Promise<{ [dateKey: string]: DayProgress }> {
    const session = await getSession();
    if (!session?.uid) return {};

    const today = new Date();
    // Ensure week starts on Monday, consistent with the progress chart component
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); 
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const dates = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const progressData: { [dateKey: string]: DayProgress } = {};

    try {
        const progressCollection = getProgressCollectionRef(session.uid);
        // In a large-scale app, you'd query for documents within the date range.
        // For this app, fetching all progress docs is acceptable.
        const q = query(progressCollection);
        const querySnapshot = await getDocs(q);
        
        const dbData: { [key: string]: DayProgress } = {};
        querySnapshot.forEach(doc => {
            dbData[doc.id] = doc.data() as DayProgress;
        });
        
        // Initialize data for every day of the week to ensure the chart is complete
        dates.forEach(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            progressData[dateKey] = dbData[dateKey] || { minutes: 0, habits: 0 };
        });

    } catch (error) {
        console.error("Error fetching progress data:", error);
         // If fetching fails, initialize with empty data to prevent crashes
         dates.forEach(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            progressData[dateKey] = { minutes: 0, habits: 0 };
        });
    }

    return progressData;
}
