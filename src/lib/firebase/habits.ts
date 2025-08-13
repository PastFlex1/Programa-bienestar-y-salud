
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";

export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found, returning empty habits.");
        return [];
    }

    try {
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure we return an array, even if the field is missing.
            return data.habits && Array.isArray(data.habits) ? data.habits : [];
        } else {
            // If the document for the date doesn't exist, there are no habits.
            return [];
        }
    } catch (error) {
        console.error(`[getHabitsForDate] Error getting habits for ${dateKey}:`, error);
        // Do not throw error, just return empty array on failure to avoid crashing.
        return [];
    }
}


export async function updateHabitsForDate(dateKey: string, habits: Habit[]): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found, skipping Firestore update for habits.");
        // Return silently, don't throw an error to prevent app crash.
        return;
    }
    
    try {
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error(`[updateHabitsForDate] Error updating habits for ${dateKey}:`, error);
        // Throwing the error so the frontend can catch it and inform the user.
        throw new Error("Could not update habits in Firestore.");
    }
}
