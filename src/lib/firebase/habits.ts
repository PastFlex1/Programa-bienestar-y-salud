
"use server";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";
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
    const path = `users/${userId}/habitDates/${dateKey}`;
    return doc(db, path);
}

/**
 * Retrieves the list of habits for a user on a specific date.
 * @param dateKey - The date in 'yyyy-MM-dd' format.
 * @returns A promise that resolves to an array of Habit objects.
 */
export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    const session = await getSession();
    if (!session) {
        return [];
    }

    try {
        const dateDocRef = getHabitDateRef(session.uid, dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.habits || [];
        } else {
            return [];
        }
    } catch (error) {
        console.error("[getHabitsForDate] Error getting habits for date:", dateKey, error);
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
    if (!session) {
        console.log("No session found, skipping Firestore update.");
        return;
    }
    
    try {
        const dateDocRef = getHabitDateRef(session.uid, dateKey);
        await setDoc(dateDocRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });

        revalidatePath("/dashboard/habits");
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        throw new Error("Could not update habits in the database.");
    }
}
