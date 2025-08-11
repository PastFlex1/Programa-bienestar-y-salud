
"use server";

import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";

// Type for storing in Firestore (without ReactNode icon)
export type Habit = {
  id: string;
  label: string;
  completed: boolean;
};

// Firestore collection reference for user data
const usersCollection = collection(db, "users");

// Gets a reference to the user's document
const getUserDocRef = (userId: string) => doc(usersCollection, userId);

// Gets a reference to a specific habit date document for a user
const getHabitDateDocRef = (userId: string, dateKey: string) => doc(getUserDocRef(userId), "habitDates", dateKey);


// Gets habits for a user on a specific date.
export async function getHabitsForDate(dateKey: string, userId: string): Promise<Habit[]> {
    if (!userId) {
        console.warn("getHabitsForDate called without userId.");
        return [];
    }
    try {
        const dateDocRef = getHabitDateDocRef(userId, dateKey);
        const docSnap = await getDoc(dateDocRef);
        return docSnap.exists() ? (docSnap.data().habits as Habit[]) : [];
    } catch (error) {
        console.error("Error getting habits:", error);
        return [];
    }
}

// Overwrites the habits for a specific date with the provided list.
// This function is used for adding, toggling, and initializing habits.
export async function updateHabitsForDate(habits: Habit[], dateKey: string, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }
    
    try {
        const dateDocRef = getHabitDateDocRef(userId, dateKey);
        // Using setDoc will create the document if it doesn't exist, or overwrite it if it does.
        await setDoc(dateDocRef, { habits });
        revalidatePath("/dashboard/habits");
    } catch (error) {
        console.error("Error updating habits for date:", error);
        throw new Error("Could not update habits.");
    }
}
