
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

const getJournalCollectionRef = (userId: string) => {
    return collection(db, 'users', userId, 'Diario');
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    const session = await getSession();
    if (!session?.uid) {
        return [];
    }

    try {
        const journalCollection = getJournalCollectionRef(session.uid);
        const q = query(journalCollection, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            // Firestore timestamps need to be converted to JS Dates, then to ISO strings
            const timestamp = data.timestamp instanceof Timestamp 
                ? data.timestamp.toDate().toISOString() 
                : new Date().toISOString(); 

            return {
                id: doc.id,
                content: data.content,
                timestamp: timestamp,
                password: data.password, // Keep password for client-side check
                isUnlocked: !data.password, // Auto-unlock if no password
            };
        });
    } catch (error) {
        console.error("[getJournalEntries] Error fetching entries:", error);
        throw new Error("Could not fetch journal entries.");
    }
}

export async function saveJournalEntry(entryData: { content: string, password?: string }): Promise<JournalEntry> {
    const session = await getSession();
    if (!session?.uid) {
        console.error("No session found, cannot save journal entry.");
        throw new Error("User not authenticated.");
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
        
        // Return the full entry object, including the new ID from Firestore
        return {
          id: docRef.id,
          content: entryData.content,
          timestamp: timestamp.toISOString(),
          password: entryData.password,
          isUnlocked: !entryData.password,
        };

    } catch (error) {
        console.error("[saveJournalEntry] Error saving entry:", error);
        throw new Error("Could not save journal entry to Firestore.");
    }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
         console.log("No session found, skipping Firestore delete.");
         throw new Error("User not authenticated.");
    }

    try {
        const entryRef = doc(db, 'users', session.uid, 'Diario', entryId);
        await deleteDoc(entryRef);
    } catch(error) {
        console.error("[deleteJournalEntry] Error deleting entry:", error);
        throw new Error("Could not delete journal entry from Firestore.");
    }
}

    