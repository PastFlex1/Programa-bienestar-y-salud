
"use server";

import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";

export interface JournalEntry {
    date: string; // ISO string
    entry: string;
}

// Firestore collection reference
const journalCollection = collection(db, "journal");

export async function saveJournalEntry(entry: JournalEntry, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const userJournalDocRef = doc(journalCollection, userId);

    try {
        // Using setDoc with merge: true will create the document if it doesn't exist,
        // or merge the new data with existing data if it does.
        // arrayUnion adds the new entry to the 'entries' array without duplicates.
        await setDoc(userJournalDocRef, {
            entries: arrayUnion(entry)
        }, { merge: true });

    } catch (error) {
        console.error("Detailed Firestore Error:", error);
        throw new Error("Could not save journal entry.");
    }
    
    revalidatePath("/dashboard/journal");
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    if (!userId) {
        console.warn("User not authenticated, returning empty entries.");
        return [];
    }

    const userJournalDocRef = doc(journalCollection, userId);

    try {
        const docSnap = await getDoc(userJournalDocRef);
        if (docSnap.exists() && docSnap.data().entries) {
            const entries = docSnap.data().entries as JournalEntry[];
            return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return [];
    }
}

export async function deleteJournalEntry(entryToDelete: JournalEntry, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const userJournalDocRef = doc(journalCollection, userId);

    try {
        const docSnap = await getDoc(userJournalDocRef);
        if (docSnap.exists()) {
             const existingEntries = docSnap.data().entries as JournalEntry[] || [];
             const updatedEntries = existingEntries.filter(e => e.date !== entryToDelete.date || e.entry !== entryToDelete.entry);
             await updateDoc(userJournalDocRef, {
                entries: updatedEntries
            });
        }
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        throw new Error("Could not delete journal entry.");
    }
    
    revalidatePath("/dashboard/journal");
}
