
"use server";

import { doc, getDoc, setDoc, collection, writeBatch, getDocs, query, where } from "firebase/firestore";
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
    if (!session) return;
    
    try {
        const progressDocRef = doc(db, `users/${session.uid}/progress/${dateKey}`);
        await setDoc(progressDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
    }
}

export async function getProgressDataForPastWeek(): Promise<{ [dateKey: string]: DayProgress }> {
    const session = await getSession();
    if (!session) return {};

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const dates = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const progressData: { [dateKey: string]: DayProgress } = {};

    try {
        const progressCollection = getProgressCollectionRef(session.uid);
        // This query fetches all documents in the user's progress subcollection.
        // For a production app with lots of data, you'd want to query just the documents for the current week.
        const querySnapshot = await getDocs(progressCollection);
        
        const dbData: { [key: string]: DayProgress } = {};
        querySnapshot.forEach(doc => {
            dbData[doc.id] = doc.data() as DayProgress;
        });
        
        dates.forEach(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            progressData[dateKey] = dbData[dateKey] || { minutes: 0, habits: 0 };
        });

    } catch (error) {
        console.error("Error fetching progress data:", error);
         dates.forEach(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            progressData[dateKey] = { minutes: 0, habits: 0 };
        });
    }

    return progressData;
}
