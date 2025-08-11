
"use server";

import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";

export interface JournalEntry {
    id: string; // Unique ID for each entry
    date: string; // ISO string
    entry: string;
}

// Firestore collection reference for all user journals
const journalCollection = collection(db, "journal");

// Gets all journal entries for a user
export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    if (!userId) {
        console.warn("User not authenticated, returning empty entries.");
        return [];
    }

    const userJournalDocRef = doc(journalCollection, userId);

    try {
        const docSnap = await getDoc(userJournalDocRef);
        if (docSnap.exists() && Array.isArray(docSnap.data().entries)) {
            const entries = docSnap.data().entries as JournalEntry[];
            // Sort by date descending (most recent first)
            return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            // No document or no entries field yet
            return [];
        }
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        throw new Error("Could not fetch journal entries.");
    }
}

// Saves a new journal entry for a user
export async function saveJournalEntry(newEntry: JournalEntry, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const userJournalDocRef = doc(journalCollection, userId);

    try {
        // 1. Get existing entries
        const docSnap = await getDoc(userJournalDocRef);
        let existingEntries: JournalEntry[] = [];
        if (docSnap.exists() && Array.isArray(docSnap.data().entries)) {
            existingEntries = docSnap.data().entries;
        }

        // 2. Modify: Add the new entry
        const updatedEntries = [...existingEntries, newEntry];
        
        // 3. Set: Overwrite the document with the updated entries array
        await setDoc(userJournalDocRef, { entries: updatedEntries }, { merge: true });

    } catch (error) {
        console.error("Detailed Firestore Error on save:", error);
        throw new Error("Could not save journal entry.");
    }
    
    // Revalidate the path to show the new entry immediately
    revalidatePath("/dashboard/journal");
}


// Deletes a specific journal entry for a user
export async function deleteJournalEntry(entryToDelete: JournalEntry, userId:string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const userJournalDocRef = doc(journalCollection, userId);
    
    try {
        // 1. Get existing entries
        const docSnap = await getDoc(userJournalDocRef);
        if (!docSnap.exists()) {
             throw new Error("Journal document not found.");
        }
        
        const existingEntries = docSnap.data().entries as JournalEntry[] || [];

        // 2. Modify: Filter out the entry to delete
        // We use the unique 'id' for reliable deletion
        const updatedEntries = existingEntries.filter(e => e.id !== entryToDelete.id);
        
        // 3. Update: Overwrite the entries array with the filtered list
        await updateDoc(userJournalDocRef, { entries: updatedEntries });
        
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        throw new Error("Could not delete journal entry.");
    }
    
    // Revalidate the path to update the UI
    revalidatePath("/dashboard/journal");
}
