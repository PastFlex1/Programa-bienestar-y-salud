
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
        // For non-logged-in users, just return the default list.
        // The data won't be saved, but the UI will work.
        return getDefaultHabits();
    }

    try {
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure the habits field exists and is an array, otherwise return defaults
            return data.habits && Array.isArray(data.habits) ? data.habits : getDefaultHabits();
        } else {
            // If no document exists for this date, return the default set
            return getDefaultHabits();
        }
    } catch (error) {
        console.error("[getHabitsForDate] Error getting habits:", error);
        // On error, return default habits to prevent UI from breaking
        return getDefaultHabits();
    }
}


export async function updateHabitsForDate(habits: Habit[], dateKey: string): Promise<void> {
    const session = await getSession();
    // If there's no user session, we simply don't save to the database.
    // The front-end will handle the state locally for the current session.
    if (!session?.uid) {
        console.log("No session found, skipping Firestore update for habits.");
        return;
    }
    
    try {
        // This correctly points to a document named after the dateKey (e.g., "2024-07-29")
        // inside the "Habitos" subcollection of the logged-in user.
        const dateDocRef = doc(db, 'users', session.uid, 'Habitos', dateKey);
        
        // setDoc will create the document if it doesn't exist, or overwrite it if it does.
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        // We throw the error so the calling function can potentially handle it (e.g., show a toast)
        throw new Error("Could not update habits in Firestore.");
    }
}
