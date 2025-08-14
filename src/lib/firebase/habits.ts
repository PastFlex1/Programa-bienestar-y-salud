
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

// Now we need the user ID to find the correct document.
export async function getHabitsForDate(userId: string, dateKey: string): Promise<Habit[]> {
    if (!db || !userId) {
        console.warn("Firebase not configured or no user ID provided, returning empty habits.");
        return [];
    }
    try {
        const dateDocRef = doc(db, 'users', userId, 'habits', dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.items && Array.isArray(data.items) ? data.items : [];
        } else {
            return [];
        }
    } catch (error) {
        console.error(`[getHabitsForDate] Error getting habits for user ${userId} and date ${dateKey}:`, error);
        return [];
    }
}

export async function updateHabitsForDate(userId: string, dateKey: string, habits: Habit[]): Promise<void> {
    if (!db || !userId) {
        console.warn("Firebase not configured or no user ID provided, skipping habit update.");
        return;
    }
    try {
        const dateDocRef = doc(db, 'users', userId, 'habits', dateKey);
        await setDoc(dateDocRef, {
            items: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error(`[updateHabitsForDate] Error updating habits for ${dateKey}:`, error);
    }
}
