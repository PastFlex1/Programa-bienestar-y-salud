
"use server";

import { ref, get, set } from "firebase/database";
import { db } from "./config";
import { revalidatePath } from "next/cache";

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
    console.log("[getHabitDateRef] Generated path:", path);
    return ref(db, path);
}

/**
 * Retrieves the list of habits for a user on a specific date.
 * @param dateKey - The date in 'yyyy-MM-dd' format.
 * @param userId - The ID of the authenticated user.
 * @returns A promise that resolves to an array of Habit objects.
 */
export async function getHabitsForDate(dateKey: string, userId: string): Promise<Habit[]> {
    if (!userId) {
        console.warn("[getHabitsForDate] Called without a userId. Returning empty array.");
        return [];
    }
    console.log(`[getHabitsForDate] Fetching for userId: ${userId}, dateKey: ${dateKey}`);
    try {
        const dateRef = getHabitDateRef(userId, dateKey);
        const snapshot = await get(dateRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // Realtime DB stores arrays as objects if keys are not 0,1,2..., so we convert it back
            const habits = data.habits ? Object.values(data.habits) as Habit[] : [];
            console.log(`[getHabitsForDate] Found ${habits.length} habits.`);
            return habits;
        } else {
            console.log(`[getHabitsForDate] No habits found for this date. Returning empty array.`);
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
 * @param userId - The ID of the authenticated user.
 */
export async function updateHabitsForDate(habits: Habit[], dateKey: string, userId: string): Promise<void> {
    if (!userId) {
        console.error("[updateHabitsForDate] User is not authenticated. Aborting.");
        throw new Error("User is not authenticated.");
    }
    console.log(`[updateHabitsForDate] Updating habits for userId: ${userId}, dateKey: ${dateKey}`);
    try {
        const dateRef = getHabitDateRef(userId, dateKey);
        // We save the habits and a timestamp.
        await set(dateRef, {
            habits: habits,
            lastUpdated: new Date().toISOString()
        });
        console.log("[updateHabitsForDate] Successfully set data in Realtime Database.");

        revalidatePath("/dashboard/habits");
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        throw new Error("Could not update habits in the database.");
    }
}
