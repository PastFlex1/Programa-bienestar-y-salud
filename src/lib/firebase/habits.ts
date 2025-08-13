
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";

// Type for storing in the database
export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

// Gets a reference to a specific habit date for a user
const getHabitDateRef = (userId: string, dateKey: string) => {
    // Path: /users/{userId}/habitDates/{yyyy-MM-dd}
    return doc(db, 'users', userId, 'habitDates', dateKey);
}

/**
 * Retrieves the list of habits for a user on a specific date.
 * @param dateKey - The date in 'yyyy-MM-dd' format.
 * @returns A promise that resolves to an array of Habit objects.
 */
export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found, can't get habits.");
        // Return default habits for non-logged-in users so the UI isn't empty
        return [
            { id: 'hydrate', label: 'Beber 2L de agua', completed: false },
            { id: 'walk', label: 'Caminar 30 minutos', completed: false },
            { id: 'mindful', label: 'Meditar 10 minutos', completed: false },
            { id: 'read', label: 'Leer 15 minutos', completed: false },
        ];
    }

    try {
        const dateDocRef = getHabitDateRef(session.uid, dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure we return an array, even if data.habits is undefined
            return data.habits || [];
        } else {
            // No document for this date, so no habits.
            // Create a default set for a better first-time user experience.
            const defaultHabits: Habit[] = [
                { id: 'hydrate', label: 'Beber 2L de agua', completed: false },
                { id: 'walk', label: 'Caminar 30 minutos', completed: false },
                { id: 'mindful', label: 'Meditar 10 minutos', completed: false },
                { id: 'read', label: 'Leer 15 minutos', completed: false },
            ];
             // Silently create the document for the user for next time.
             await updateHabitsForDate(defaultHabits, dateKey);
            return defaultHabits;
        }
    } catch (error) {
        console.error("[getHabitsForDate] Error getting habits for date:", dateKey, error);
        // Return empty array on error to prevent app crash
        return [];
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
        // If there's no user session, we don't save to the database.
        // The state will be kept on the client-side for the duration of the session.
        console.log("No session found, skipping Firestore update for habits.");
        return;
    }
    
    try {
        const dateDocRef = getHabitDateRef(session.uid, dateKey);
        // Use setDoc which creates the document if it doesn't exist, or overwrites it if it does.
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        // We don't throw an error to prevent crashing the app on a background save failure.
    }
}
