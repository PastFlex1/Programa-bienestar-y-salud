
"use server";

import { doc, setDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";
import { startOfWeek, format, addDays } from "date-fns";

export type DayProgress = {
    minutes: number;
    habits: number;
};

export async function updateProgressData(dateKey: string, data: DayProgress): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found. Cannot update progress data.");
        return;
    };
    
    try {
        // This path is correct: /users/{userId}/progress/{dateKey}
        const progressDocRef = doc(db, 'users', session.uid, 'progress', dateKey);
        await setDoc(progressDocRef, data, { merge: true });
    } catch (error) {
        console.error(`Error updating progress for ${dateKey}:`, error);
    }
}

export async function getProgressDataForPastWeek(): Promise<{ [dateKey: string]: DayProgress }> {
    const today = new Date();
    // Monday as the start of the week
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const progressData: { [dateKey: string]: DayProgress } = {};

    // Initialize with empty data for all 7 days of the week.
    for(let i=0; i<7; i++) {
        const date = addDays(weekStart, i);
        const dateKey = format(date, 'yyyy-MM-dd');
        progressData[dateKey] = { minutes: 0, habits: 0 };
    }
    
    const session = await getSession();
    if (!session?.uid) {
        return progressData; // Return empty data for non-logged in users
    }

    try {
        const progressCollectionRef = collection(db, 'users', session.uid, 'progress');
        const querySnapshot = await getDocs(query(progressCollectionRef));
        
        // This will overwrite the initialized empty data with data from Firestore if it exists.
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
