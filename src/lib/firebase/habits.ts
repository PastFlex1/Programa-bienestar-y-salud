
"use server";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";

// Type for storing in Firestore
export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

// Gets a reference to a specific habit date document for a user
const getHabitDateDocRef = (userId: string, dateKey: string) => {
    // Path: /users/{userId}/habitDates/{yyyy-MM-dd}
    return doc(db, "users", userId, "habitDates", dateKey);
}

/**
 * Retrieves the list of habits for a user on a specific date.
 * @param dateKey - The date in 'yyyy-MM-dd' format.
 * @param userId - The ID of the authenticated user.
 * @returns A promise that resolves to an array of Habit objects.
 */
export async function getHabitsForDate(dateKey: string, userId: string): Promise<Habit[]> {
    console.log(`[getHabitsForDate] Called with userId: ${userId}, dateKey: ${dateKey}`);
    if (!userId) {
        console.warn("[getHabitsForDate] Called without a userId.");
        return [];
    }
    try {
        const dateDocRef = getHabitDateDocRef(userId, dateKey);
        console.log(`[getHabitsForDate] Getting doc from path: ${dateDocRef.path}`);
        const docSnap = await getDoc(dateDocRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("[getHabitsForDate] Document exists. Data:", data);
            // Ensure the habits field is an array before returning
            const habits = Array.isArray(data.habits) ? data.habits : [];
            console.log("[getHabitsForDate] Returning habits:", habits);
            return habits;
        } else {
            console.log("[getHabitsForDate] Document does not exist.");
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
    console.log(`[updateHabitsForDate] Called with userId: ${userId}, dateKey: ${dateKey}`);
    console.log(`[updateHabitsForDate] Habits to save:`, habits);
    
    if (!userId) {
        console.error("[updateHabitsForDate] User is not authenticated.");
        throw new Error("User is not authenticated.");
    }
    
    try {
        const dateDocRef = getHabitDateDocRef(userId, dateKey);
        console.log(`[updateHabitsForDate] Setting doc at path: ${dateDocRef.path}`);
        await setDoc(dateDocRef, { 
            habits: habits,
            lastUpdated: serverTimestamp()
        }, { merge: true }); // Use merge to be safe
        
        console.log("[updateHabitsForDate] Document successfully written.");
        revalidatePath("/dashboard/habits");
        console.log("[updateHabitsForDate] Path revalidated.");
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        throw new Error("Could not update habits in the database.");
    }
}

    