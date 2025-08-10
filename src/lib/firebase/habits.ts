
"use server";

import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";
import type { Habit } from "@/components/habit-tracker";
import { revalidatePath } from "next/cache";

// Firestore collection reference
const habitsCollection = collection(db, "habits");

// Gets habits for a user on a specific date
export async function getHabitsForDate(dateKey: string) {
    const session = await getSession();
    if (!session?.email) {
        throw new Error("User not authenticated");
    }

    try {
        const docRef = doc(habitsCollection, session.email, "dates", dateKey);
        const docSnap = await getDoc(docRef);

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
export async function toggleHabit(habitId: string, completed: boolean, dateKey: string) {
    const session = await getSession();
    if (!session?.email) {
        throw new Error("User not authenticated");
    }
    
    const docRef = doc(habitsCollection, session.email, "dates", dateKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const habits = docSnap.data().habits as Habit[];
        const updatedHabits = habits.map(h => 
            h.id === habitId ? { ...h, completed } : h
        );
        await updateDoc(docRef, { habits: updatedHabits });
    }
    
    revalidatePath("/dashboard/habits");
}

// Adds a new custom habit for a user on a specific date
export async function addHabit(newHabit: Habit, dateKey: string) {
    const session = await getSession();
    if (!session?.email) {
        throw new Error("User not authenticated");
    }

    const docRef = doc(habitsCollection, session.email, "dates", dateKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        // Add to existing array
        await updateDoc(docRef, {
            habits: arrayUnion(newHabit)
        });
    } else {
        // Create a new document for the date
        await setDoc(docRef, {
            habits: [newHabit]
        });
    }
    
    revalidatePath("/dashboard/habits");
}

// Initializes habits for a new day if they don't exist
export async function initializeHabitsForDay(initialHabits: Habit[], dateKey: string) {
    const session = await getSession();
    if (!session?.email) {
        throw new Error("User not authenticated");
    }

    const docRef = doc(habitsCollection, session.email, "dates", dateKey);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        await setDoc(docRef, { habits: initialHabits });
    }
    revalidatePath("/dashboard/habits");
}
