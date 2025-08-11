
"use server";

import { collection, doc, addDoc, getDocs, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";

export interface JournalEntry {
    id: string;      // Document ID from Firestore
    date: string;    // ISO string format
    entry: string;
}

// Helper function to get the subcollection for a user's journal entries
const getJournalEntriesCollection = (userId: string) => {
    return collection(db, 'users', userId, 'journalEntries');
}

// Gets all journal entries for a user, ordered by date
export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    if (!userId) {
        console.warn("User not authenticated, returning empty entries.");
        return [];
    }
    
    const entriesCollection = getJournalEntriesCollection(userId);
    const q = query(entriesCollection, orderBy("date", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        const entries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
                id: doc.id,
                date: (data.date as Timestamp).toDate().toISOString(),
                entry: data.entry
            });
        });
        return entries;
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        throw new Error("Could not fetch journal entries.");
    }
}

// Saves a new journal entry for a user
export async function saveJournalEntry(userId: string, entryText: string, date: Date) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const entriesCollection = getJournalEntriesCollection(userId);
    
    try {
        await addDoc(entriesCollection, {
            entry: entryText,
            date: Timestamp.fromDate(date) // Store as Firestore Timestamp for proper ordering
        });
    } catch (error) {
        console.error("Detailed Firestore Error on save:", error);
        throw new Error("Could not save journal entry.");
    }
    
    // Revalidate the path to show the new entry immediately
    revalidatePath("/dashboard/journal");
}

// Deletes a specific journal entry for a user by its document ID
export async function deleteJournalEntry(userId: string, entryId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const entryDocRef = doc(db, 'users', userId, 'journalEntries', entryId);
    
    try {
        await deleteDoc(entryDocRef);
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        throw new Error("Could not delete journal entry.");
    }
    
    // Revalidate the path to update the UI
    revalidatePath("/dashboard/journal");
}

    