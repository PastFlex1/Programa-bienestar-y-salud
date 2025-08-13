
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
        // For non-logged-in users, there are no habits.
        return [];
    }

    try {
        // Path: /users/{uid}/Habitos/{dateKey}
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure we return the habits array, or an empty one if the field doesn't exist.
            return data.habits && Array.isArray(data.habits) ? data.habits : [];
        } else {
            // If the document for the date doesn't exist, there are no habits for that day.
            return [];
        }
    } catch (error) {
        console.error(`[getHabitsForDate] Error getting habits for ${dateKey}:`, error);
        // On error, return an empty array to prevent the app from crashing.
        return [];
    }
}


export async function updateHabitsForDate(dateKey: string, habits: Habit[]): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        console.error("No session found, cannot update habits.");
        // We throw an error so the frontend knows the save failed.
        throw new Error("User not authenticated.");
    }
    
    try {
        // Path: /users/{uid}/Habitos/{dateKey}
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        
        // This will create the document if it doesn't exist, or overwrite it if it does.
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error(`[updateHabitsForDate] Error updating habits for ${dateKey}:`, error);
        // Throw the error so the frontend can catch it and inform the user.
        throw new Error("Could not update habits in Firestore.");
    }
}

    