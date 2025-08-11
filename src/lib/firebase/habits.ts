
"use server";

import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./config";
import type { Habit } from "@/components/habit-tracker";
import { revalidatePath } from "next/cache";

// Firestore collection reference for user data
const usersCollection = collection(db, "users");

// Gets a reference to the user's document
const getUserDocRef = (userId: string) => doc(usersCollection, userId);

// Gets habits for a user on a specific date from a subcollection
export async function getHabitsForDate(dateKey: string, userId: string) {
    if (!userId) {
        console.warn("getHabitsForDate called without userId.");
        return [];
    }

    try {
        const dateDocRef = doc(getUserDocRef(userId), "habitDates", dateKey);
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            return docSnap.data().habits as Habit[];
        } else {
            return []; // No habits for this date yet
        }
    } catch (error) {
        console.error("Error getting habits:", error);
        return [];
    }
}

// Toggles the completion status of a habit
export async function toggleHabit(habitId: string, completed: boolean, dateKey: string, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }
    
    const dateDocRef = doc(getUserDocRef(userId), "habitDates", dateKey);
    const docSnap = await getDoc(dateDocRef);

    if (docSnap.exists()) {
        const habits = docSnap.data().habits as Habit[];
        const updatedHabits = habits.map(h => 
            h.id === habitId ? { ...h, completed } : h
        );
        await updateDoc(dateDocRef, { habits: updatedHabits });
    }
    
    revalidatePath("/dashboard/habits");
}

// Adds a new custom habit for a user on a specific date
export async function addHabit(newHabit: Habit, dateKey: string, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const dateDocRef = doc(getUserDocRef(userId), "habitDates", dateKey);
    
    try {
        const docSnap = await getDoc(dateDocRef);

        if (docSnap.exists()) {
            // If the document for the date already exists, add the new habit to the array
            await updateDoc(dateDocRef, {
                habits: arrayUnion(newHabit)
            });
        } else {
            // If no document exists for this date, create it with the new habit
             await setDoc(dateDocRef, {
                habits: [newHabit]
            });
        }
    } catch (error) {
        console.error("Error adding habit:", error);
        throw new Error("Could not add habit.");
    }
    
    revalidatePath("/dashboard/habits");
}


// Initializes habits for a new day if they don't exist
export async function initializeHabitsForDay(initialHabits: Habit[], dateKey: string, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const dateDocRef = doc(getUserDocRef(userId), "habitDates", dateKey);
    const docSnap = await getDoc(dateDocRef);

    if (!docSnap.exists()) {
        // We only set the initial habits if NO document exists for that day.
        // We also ensure the parent user document exists.
        const userDocRef = getUserDocRef(userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, { createdAt: new Date() });
        }
        await setDoc(dateDocRef, { habits: initialHabits });
    }
    revalidatePath("/dashboard/habits");
}
