
"use server";

import { doc, getDoc, setDoc, serverTimestamp, collection, writeBatch } from "firebase/firestore";
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
    if (!userId) {
        console.warn("[getHabitsForDate] Called without a userId.");
        return [];
    }
    try {
        const dateDocRef = getHabitDateDocRef(userId, dateKey);
        const docSnap = await getDoc(dateDocRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const habits = Array.isArray(data.habits) ? data.habits : [];
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
 * @param userId - The ID of the authenticated user.
 */
export async function updateHabitsForDate(habits: Habit[], dateKey: string, userId: string): Promise<void> {
    if (!userId) {
        console.error("[updateHabitsForDate] User is not authenticated.");
        throw new Error("User is not authenticated.");
    }
    
    try {
        const dateDocRef = getHabitDateDocRef(userId, dateKey);
        await setDoc(dateDocRef, { 
            habits: habits,
            lastUpdated: serverTimestamp()
        }, { merge: true }); 
        
        revalidatePath("/dashboard/habits");
    } catch (error) {
        console.error("[updateHabitsForDate] Error updating habits for date:", dateKey, error);
        throw new Error("Could not update habits in the database.");
    }
}
