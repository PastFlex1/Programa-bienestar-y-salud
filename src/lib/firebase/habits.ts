
"use server";

import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";

export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

// Gets the reference to the collection of daily habit documents for a specific user
const getHabitDatesCollectionRef = (userId: string) => {
    // Path: /Habitos/{userId}/habitDates
    return collection(db, 'Habitos', userId, 'habitDates');
}

export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    const session = await getSession();
    if (!session?.uid) {
        // Return an empty array if there's no logged-in user
        return [];
    }

    try {
        // Get the specific document for the given date within the user's habit dates subcollection
        const dateDocRef = doc(getHabitDatesCollectionRef(session.uid), dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure the habits field exists and is an array before returning
            return data.habits && Array.isArray(data.habits) ? data.habits : [];
        } else {
            // If the document for the date doesn't exist, return an empty array
            return [];
        }
    } catch (error) {
        console.error("[getHabitsForDate] Error getting habits:", error);
        // In case of an error, return an empty array to prevent the app from crashing
        return [];
    }
}


export async function updateHabitsForDate(habits: Habit[], dateKey: string): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        // If there's no user session, log it and do nothing.
        console.log("No session found, skipping Firestore update for habits.");
        return;
    }
    
    try {
        // Get a reference to the document for the specific date.
        // This will live inside the user's document in the 'Habitos' collection.
        // Path: /Habitos/{userId}/habitDates/{dateKey}
        const dateDocRef = doc(getHabitDatesCollectionRef(session.uid), dateKey);
        
        // Set the document with the new list of habits.
        // This will create the document if it doesn't exist, or overwrite it if it does.
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        // Throwing the error so the frontend can potentially handle it (e.g., show a toast)
        throw new Error("Could not update habits in Firestore.");
    }
}
