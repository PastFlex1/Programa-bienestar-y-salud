
"use server";

import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";

// Type for storing in the database
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

/**
 * Retrieves the list of habits for a user on a specific date.
 * @param dateKey - The date in 'yyyy-MM-dd' format.
 * @returns A promise that resolves to an array of Habit objects.
 */
export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    const session = await getSession();
    if (!session?.uid) {
        // For non-logged-in users, just return the default template.
        return getDefaultHabits();
    }

    try {
        const dateDocRef = doc(db, 'users', session.uid, 'habitDates', dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.habits || [];
        } else {
            // Document doesn't exist for this date, create it with default habits.
            const defaultHabits = getDefaultHabits();
            await updateHabitsForDate(defaultHabits, dateKey);
            return defaultHabits;
        }
    } catch (error) {
        console.error("[getHabitsForDate] Error getting habits for date:", dateKey, error);
        // On error, return default habits to prevent app crash.
        return getDefaultHabits();
    }
}

/**
 * Overwrites the entire list of habits for a user on a specific date.
 * @param habits - The complete, updated array of habits for the day.
 * @param dateKey - The date in 'yyyy-MM-dd' format.
 */
export async function updateHabitsForDate(habits: Habit[], dateKey: string): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        // Silently fail if there's no user session.
        // The state is kept on the client-side for the duration of their session.
        console.log("No session found, skipping Firestore update for habits.");
        return;
    }
    
    try {
        // This path is correct: /users/{userId}/habitDates/{dateKey}
        const dateDocRef = doc(db, 'users', session.uid, 'habitDates', dateKey);
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        // Do not throw an error to prevent crashing the app.
    }
}
