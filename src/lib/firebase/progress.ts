
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
        const progressDocRef = doc(db, 'users', session.uid, 'Progreso', dateKey);
        // Use { merge: true } to update fields without overwriting the whole document
        await setDoc(progressDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
        throw new Error("Could not update progress data.");
    }
}

export async function getProgressDataForPastWeek(): Promise<{ [dateKey: string]: DayProgress }> {
    const today = new Date();
    // Monday as the start of the week
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); 
    const progressData: { [dateKey: string]: DayProgress } = {};

    // Initialize the structure for the whole week
    const dateKeys: string[] = [];
    for(let i=0; i<7; i++) {
        const date = addDays(weekStart, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        progressData[dateKey] = { minutes: 0, habits: 0 };
        dateKeys.push(dateKey);
    }
    
    const session = await getSession();
    if (!session?.uid) {
        // Return the empty initialized structure for non-logged-in users
        return progressData;
    }

    try {
        // Reference the "Progreso" subcollection
        const progressCollectionRef = collection(db, 'users', session.uid, 'Progreso');
        
        // Fetch all documents for the past week in a more optimized way if needed,
        // but fetching one by one is fine for 7 documents.
        for (const dateKey of dateKeys) {
            const docRef = doc(progressCollectionRef, dateKey);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                 progressData[dateKey] = docSnap.data() as DayProgress;
            }
        }
    } catch (error) {
        console.error("Error fetching progress data for the week:", error);
    }

    return progressData;
}
