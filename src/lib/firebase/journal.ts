
"use server";

import { collection, doc, addDoc, getDocs, deleteDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";

export interface JournalEntry {
    id: string;      // Document ID from Firestore
    userId: string;  // ID of the user who owns the entry
    date: string;    // ISO string format
    entry: string;
}

// Use a top-level collection for all journal entries
const journalCollection = collection(db, 'journal');

// Gets all journal entries for a user, ordered by date
export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    if (!userId) {
        console.warn("User not authenticated, returning empty entries.");
        return [];
    }
    
    // Query the top-level collection for documents where userId matches
    const q = query(journalCollection, where("userId", "==", userId), orderBy("date", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        const entries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
                id: doc.id,
                userId: data.userId,
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
export async function saveJournalEntry(userId: string, entryText: string, dateIsoString: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }
    
    try {
        // Convert ISO string back to a Date object, then to a Firestore Timestamp
        const date = new Date(dateIsoString);
        await addDoc(journalCollection, {
            userId: userId,
            entry: entryText,
            date: Timestamp.fromDate(date)
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

    const entryDocRef = doc(db, 'journal', entryId);
    
    // Optional security check: Ensure the entry belongs to the user trying to delete it
    // Note: This is best enforced with Firestore Security Rules for true security.
    const docSnap = await getDocs(query(journalCollection, where('__name__', '==', entryId), where('userId', '==', userId)));
    if (docSnap.empty) {
        console.error("Security check failed: User does not have permission to delete this entry or entry does not exist.");
        throw new Error("Permission denied or entry not found.");
    }

    try {
        await deleteDoc(entryDocRef);
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        throw new Error("Could not delete journal entry.");
    }
    
    revalidatePath("/dashboard/journal");
}
