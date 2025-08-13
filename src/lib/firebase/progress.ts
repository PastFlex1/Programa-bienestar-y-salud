
"use server";

import { doc, getDoc, setDoc, collection, writeBatch, getDocs } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";
import { eachDayOfInterval, format, startOfWeek } from "date-fns";

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
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const dates = eachDayOfInterval({ start: weekStart, end: today });

    const progressData: { [dateKey: string]: DayProgress } = {};

    try {
        const progressCollection = getProgressCollectionRef(session.uid);
        const querySnapshot = await getDocs(progressCollection);
        
        const dbData: { [key: string]: DayProgress } = {};
        querySnapshot.forEach(doc => {
            dbData[doc.id] = doc.data() as DayProgress;
        });
        
        dates.forEach(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            if (dbData[dateKey]) {
                progressData[dateKey] = dbData[dateKey];
            } else {
                progressData[dateKey] = { minutes: 0, habits: 0 };
            }
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
