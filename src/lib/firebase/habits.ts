
"use server";

import { ref, get, set } from "firebase/database";
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
    return ref(db, path);
}

/**
 * Retrieves the list of habits for a user on a specific date.
 * @param dateKey - The date in 'yyyy-MM-dd' format.
 * @returns A promise that resolves to an array of Habit objects.
 */
export async function getHabitsForDate(dateKey: string): Promise<Habit[]> {
    const session = await getSession();
    if (!session) return [];

    try {
        const dateRef = getHabitDateRef(session.uid, dateKey);
        const snapshot = await get(dateRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // Realtime DB stores arrays as objects if keys are not 0,1,2..., so we convert it back
            const habits = data.habits ? Object.values(data.habits) as Habit[] : [];
            return habits;
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
        throw new Error("User is not authenticated.");
    }
    
    try {
        const dateRef = getHabitDateRef(session.uid, dateKey);
        await set(dateRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });

        revalidatePath("/dashboard/habits");
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        throw new Error("Could not update habits in the database.");
    }
}
