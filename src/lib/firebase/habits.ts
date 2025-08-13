
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";

export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

const getDefaultHabits = (): Habit[] => [
    { id: 'hydrate', label: 'Beber 2L de agua', completed: false },
    { id: 'walk', label: 'Caminar 30 minutos', completed: false },
    { id: 'mindful', label: 'Meditar 10 minutos', completed: false },
    { id: 'read', label: 'Leer 15 minutos', completed: false },
];


export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    const session = await getSession();
    if (!session?.uid) {
        // For non-logged-in users, return default habits without hitting DB
        return getDefaultHabits();
    }

    try {
        // Use 'Habitos' subcollection as requested
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure we return a valid habits array
            return data.habits && Array.isArray(data.habits) ? data.habits : getDefaultHabits();
        } else {
            // If document for the date doesn't exist, return defaults.
            // It will be created on the first update.
            return getDefaultHabits();
        }
    } catch (error) {
        console.error("[getHabitsForDate] Error getting habits:", error);
        // On error, return defaults to avoid crashing the UI
        return getDefaultHabits();
    }
}


export async function updateHabitsForDate(habits: Habit[], dateKey: string): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        // Silently ignore if there is no user session
        console.log("No session found, skipping Firestore update for habits.");
        return;
    }
    
    try {
        // Use 'Habitos' subcollection as requested
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        }, { merge: true }); // Use merge to avoid overwriting other potential fields
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        // Do not throw an error to prevent crashing the app.
    }
}
