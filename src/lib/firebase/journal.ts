
"use server";

import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";

export type JournalEntry = {
  id: string;
  content: string;
  timestamp: string; // ISO 8601 format
  password?: string;
  isUnlocked?: boolean; // Client-side state, not stored in DB
};

// This function gets a reference to the 'journal' subcollection for a specific user.
const getJournalCollectionRef = (userId: string) => {
    // Path: users/{userId}/journal
    return collection(db, 'users', userId, 'journal');
}

// This function gets a reference to a specific entry document within the journal subcollection.
const getJournalDocRef = (userId: string, entryId: string) => {
    return doc(db, 'users', userId, 'journal', entryId);
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    const session = await getSession();
    if (!session?.uid) {
        console.log("No session found, can't get journal entries.");
        return [];
    }

    try {
        const journalCollection = getJournalCollectionRef(session.uid);
        const q = query(journalCollection, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        const entries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp instanceof Timestamp 
                ? data.timestamp.toDate().toISOString() 
                : new Date().toISOString();

            entries.push({
                id: doc.id,
                content: data.content,
                timestamp: timestamp,
                password: data.password,
                isUnlocked: !data.password,
            });
        });
        
        return entries;
    } catch (error) {
        console.error("[getJournalEntries] Error fetching entries:", error);
        return [];
    }
}

export async function saveJournalEntry(entryData: Omit<JournalEntry, 'id' | 'isUnlocked'>): Promise<JournalEntry> {
    const session = await getSession();
    if (!session?.uid) {
        throw new Error("User not authenticated. Cannot save entry.");
    }
    
    try {
        const journalCollection = getJournalCollectionRef(session.uid);
        
        const newEntryPayload: {
            content: string;
            timestamp: Timestamp;
            password?: string;
        } = {
            content: entryData.content,
            timestamp: Timestamp.fromDate(new Date(entryData.timestamp)),
        };

        if (entryData.password) {
            newEntryPayload.password = entryData.password;
        }

        const docRef = await addDoc(journalCollection, newEntryPayload);
        
        revalidatePath("/dashboard/journal");
        
        return {
          id: docRef.id,
          content: entryData.content,
          timestamp: entryData.timestamp,
          password: entryData.password,
          isUnlocked: !entryData.password,
        };

    } catch (error) {
        console.error("[saveJournalEntry] Error saving entry:", error);
        throw new Error("Could not save journal entry.");
    }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        throw new Error("User not authenticated. Cannot delete entry.");
    }

    try {
        const entryRef = getJournalDocRef(session.uid, entryId);
        await deleteDoc(entryRef);
        revalidatePath("/dashboard/journal");
    } catch(error) {
        console.error("[deleteJournalEntry] Error deleting entry:", error);
        throw new Error("Could not delete journal entry.");
    }
}
