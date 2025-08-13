
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
                : new Date().toISOString(); 

            return {
                id: doc.id,
                content: data.content,
                timestamp: timestamp,
                password: data.password,
                isUnlocked: !data.password, 
            };
        });
    } catch (error) {
        console.error("[getJournalEntries] Error fetching entries:", error);
        return [];
    }
}

/**
 * Saves a new journal entry for the authenticated user.
 * @param entryData - An object containing the content and optional password for the new entry.
 * @returns A promise that resolves to the newly created JournalEntry object or null if not logged in.
 */
export async function saveJournalEntry(entryData: { content: string, password?: string }): Promise<JournalEntry | null> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found, skipping Firestore save for journal entry.");
        return null; // Return null to indicate no save occurred
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
        
        return {
          id: docRef.id,
          content: entryData.content,
          timestamp: timestamp.toISOString(),
          password: entryData.password,
          isUnlocked: !entryData.password,
        };

    } catch (error) {
        console.error("[saveJournalEntry] Error saving entry:", error);
        // We don't re-throw, as the client handles optimistic updates.
        return null;
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
        const entryRef = doc(db, 'users', session.uid, 'journal', entryId);
        await deleteDoc(entryRef);
    } catch(error) {
        console.error("[deleteJournalEntry] Error deleting entry:", error);
        // Do not throw to avoid crashing the app on a failed delete.
    }
}
