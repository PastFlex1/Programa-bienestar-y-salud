
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

// The data is now public, so we don't need a user ID.
// The dateKey serves as the document ID in the "Habitos" collection.
export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    if (!db) {
        console.warn("Firebase not configured, returning empty habits.");
        return [];
    }
    try {
        const dateDocRef = doc(db, 'Habitos', dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.habits && Array.isArray(data.habits) ? data.habits : [];
        } else {
            return [];
        }
    } catch (error) {
        console.error(`[getHabitsForDate] Error getting habits for ${dateKey}:`, error);
        return [];
    }
}

// The data is now public, so we don't need a user ID.
export async function updateHabitsForDate(dateKey: string, habits: Habit[]): Promise<void> {
    if (!db) {
        console.warn("Firebase not configured, skipping habit update.");
        return;
    }
    try {
        const dateDocRef = doc(db, 'Habitos', dateKey);
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error(`[updateHabitsForDate] Error updating habits for ${dateKey}:`, error);
        throw new Error("Could not update habits in Firestore.");
    }
}
