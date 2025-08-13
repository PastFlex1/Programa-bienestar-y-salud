
"use server";

import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";

export type JournalEntry = {
  id: string;
  content: string;
  timestamp: string; // ISO 8601 format
  password?: string;
  isUnlocked?: boolean; // Client-side state, not stored in DB
};

// Gets a reference to the 'journal' subcollection for a specific user.
const getJournalCollectionRef = (userId: string) => {
    return collection(db, 'users', userId, 'journal');
}

// Gets a reference to a specific entry document within the journal subcollection.
const getJournalDocRef = (userId: string, entryId: string) => {
    return doc(db, 'users', userId, 'journal', entryId);
}

/**
 * Fetches all journal entries for the currently authenticated user.
 * @returns A promise that resolves to an array of JournalEntry objects.
 */
export async function getJournalEntries(): Promise<JournalEntry[]> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found, returning empty journal.");
        return [];
    }

    try {
        const journalCollection = getJournalCollectionRef(session.uid);
        const q = query(journalCollection, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp instanceof Timestamp 
                ? data.timestamp.toDate().toISOString() 
                : new Date().toISOString(); // Fallback for any unexpected format

            return {
                id: doc.id,
                content: data.content,
                timestamp: timestamp,
                password: data.password,
                isUnlocked: !data.password, // Entries are unlocked by default if they don't have a password
            };
        });
    } catch (error) {
        console.error("[getJournalEntries] Error fetching entries:", error);
        // Return an empty array on error to prevent the app from crashing.
        return [];
    }
}

/**
 * Saves a new journal entry for the authenticated user.
 * @param entryData - An object containing the content and optional password for the new entry.
 * @returns A promise that resolves to the newly created JournalEntry object.
 */
export async function saveJournalEntry(entryData: { content: string, password?: string }): Promise<JournalEntry | null> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found, skipping Firestore update.");
        return null;
    }
    
    try {
        const journalCollectionRef = getJournalCollectionRef(session.uid);
        
        const timestamp = new Date();

        const newEntryPayload: {
            content: string;
            timestamp: Timestamp;
            password?: string;
        } = {
            content: entryData.content,
            timestamp: Timestamp.fromDate(timestamp),
        };

        if (entryData.password) {
            newEntryPayload.password = entryData.password;
        }

        const docRef = await addDoc(journalCollectionRef, newEntryPayload);
        
        // Return the full entry object to the client for optimistic UI updates
        return {
          id: docRef.id,
          content: entryData.content,
          timestamp: timestamp.toISOString(),
          password: entryData.password,
          isUnlocked: !entryData.password,
        };

    } catch (error) {
        console.error("[saveJournalEntry] Error saving entry:", error);
        throw new Error("Could not save journal entry to the database.");
    }
}

/**
 * Deletes a specific journal entry for the authenticated user.
 * @param entryId - The ID of the journal entry to delete.
 */
export async function deleteJournalEntry(entryId: string): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
         console.log("No session found, skipping Firestore delete.");
        return;
    }

    try {
        const entryRef = getJournalDocRef(session.uid, entryId);
        await deleteDoc(entryRef);
    } catch(error) {
        console.error("[deleteJournalEntry] Error deleting entry:", error);
        throw new Error("Could not delete journal entry from the database.");
    }
}
