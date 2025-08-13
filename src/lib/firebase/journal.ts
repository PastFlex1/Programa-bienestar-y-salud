
"use server";

import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./config";

export type JournalEntry = {
  id: string;
  content: string;
  timestamp: string; // ISO 8601 format
};

// Data is now public, so we reference a root "Diario" collection.
const getJournalCollectionRef = () => {
    return collection(db, 'Diario');
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    if (!db) {
        console.warn("Firebase not configured, returning empty journal entries.");
        return [];
    }

    try {
        const journalCollection = getJournalCollectionRef();
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
            };
        });
    } catch (error) {
        console.error("[getJournalEntries] Error fetching entries:", error);
        throw new Error("Could not fetch journal entries.");
    }
}

export async function saveJournalEntry(entryData: { content: string }): Promise<JournalEntry> {
    if (!db) {
        console.warn("Firebase not configured, cannot save journal entry.");
        throw new Error("Database not available.");
    }
    
    try {
        const journalCollectionRef = getJournalCollectionRef();
        const timestamp = new Date();

        const newEntryPayload = {
            content: entryData.content,
            timestamp: Timestamp.fromDate(timestamp),
        };

        const docRef = await addDoc(journalCollectionRef, newEntryPayload);
        
        return {
          id: docRef.id,
          content: entryData.content,
          timestamp: timestamp.toISOString(),
        };

    } catch (error) {
        console.error("[saveJournalEntry] Error saving entry:", error);
        throw new Error("Could not save journal entry to Firestore.");
    }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
    if (!db) {
         console.warn("Firebase not configured, cannot delete journal entry.");
         throw new Error("Database not available.");
    }

    try {
        const entryRef = doc(db, 'Diario', entryId);
        await deleteDoc(entryRef);
    } catch(error) {
        console.error("[deleteJournalEntry] Error deleting entry:", error);
        throw new Error("Could not delete journal entry from Firestore.");
    }
}
