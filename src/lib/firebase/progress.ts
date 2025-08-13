
"use server";

import { doc, getDoc, setDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";
import { startOfWeek, format, addDays } from "date-fns";

export type DayProgress = {
    minutes: number;
    habits: number;
};

const getProgressDocRef = (userId: string, dateKey: string) => {
    // users/{userId}/progress/{yyyy-MM-dd}
    return doc(db, 'users', userId, 'progress', dateKey);
}

export async function updateProgressData(dateKey: string, data: DayProgress): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        console.warn("No session found. Cannot update progress data.");
        return;
    };
    
    try {
        const progressDocRef = getProgressDocRef(session.uid, dateKey);
        await setDoc(progressDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
    }
}

export async function getProgressDataForPastWeek(): Promise<{ [dateKey: string]: DayProgress }> {
    const session = await getSession();
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const progressData: { [dateKey: string]: DayProgress } = {};

    // Initialize with empty data first to ensure chart has all days
    for(let i=0; i<7; i++) {
        const date = addDays(weekStart, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        progressData[dateKey] = { minutes: 0, habits: 0 };
    }
    
    if (!session?.uid) {
        return progressData; // Return empty data for non-logged in users
    }

    try {
        const progressCollectionRef = collection(db, 'users', session.uid, 'progress');
        const querySnapshot = await getDocs(query(progressCollectionRef));
        
        querySnapshot.forEach(doc => {
            if (progressData.hasOwnProperty(doc.id)) {
                progressData[doc.id] = doc.data() as DayProgress;
            }
        });

    } catch (error) {
        console.error("Error fetching progress data:", error);
    }

    return progressData;
}
