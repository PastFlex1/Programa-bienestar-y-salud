
"use server";

import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./config";

export type JournalEntry = {
  id: string;
  content: string;
  timestamp: string; // ISO 8601 format
};

const getJournalCollectionRef = (userId: string) => {
    return collection(db, 'users', userId, 'journal');
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    if (!db || !userId) {
        console.warn("Firebase not configured or no userId, returning empty journal entries.");
        return [];
    }

    try {
        const journalCollection = getJournalCollectionRef(userId);
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

export async function saveJournalEntry(userId: string, entryData: { content: string }): Promise<JournalEntry> {
    if (!db || !userId) {
        console.warn("Firebase not configured or no userId, cannot save journal entry.");
        throw new Error("Database not available.");
    }
    
    try {
        const journalCollectionRef = getJournalCollectionRef(userId);
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

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
    if (!db || !userId) {
         console.warn("Firebase not configured or no userId, cannot delete journal entry.");
         throw new Error("Database not available.");
    }

    try {
        const entryRef = doc(db, 'users', userId, 'journal', entryId);
        await deleteDoc(entryRef);
    } catch(error) {
        console.error("[deleteJournalEntry] Error deleting entry:", error);
        throw new Error("Could not delete journal entry from Firestore.");
    }
}
