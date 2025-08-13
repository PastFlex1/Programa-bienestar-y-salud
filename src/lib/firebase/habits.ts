
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";

export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

// Return an empty array by default instead of a predefined list.
const getDefaultHabits = (): Habit[] => [];


export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    const session = await getSession();
    if (!session?.uid) {
        return getDefaultHabits();
    }

    try {
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.habits && Array.isArray(data.habits) ? data.habits : getDefaultHabits();
        } else {
            return getDefaultHabits();
        }
    } catch (error) {
        console.error("[getHabitsForDate] Error getting habits:", error);
        return getDefaultHabits();
    }
}


export async function updateHabitsForDate(habits: Habit[], dateKey: string): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found, skipping Firestore update for habits.");
        return;
    }
    
    try {
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        throw new Error("Could not update habits in Firestore.");
    }
}

