
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

const getJournalCollectionRef = (userId: string) => {
    // This is a subcollection under a user document
    return collection(db, 'users', userId, 'journal');
}

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
            // Firestore returns timestamps, convert them to ISO strings
            const timestamp = data.timestamp instanceof Timestamp 
                ? data.timestamp.toDate().toISOString() 
                : new Date().toISOString();

            entries.push({
                id: doc.id,
                content: data.content,
                timestamp: timestamp,
                password: data.password, // Only present if set
                isUnlocked: !!data.password ? false : true, // Logic to handle locked entries
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
        
        const newEntry: any = {
            content: entryData.content,
            timestamp: Timestamp.fromDate(new Date(entryData.timestamp)),
        };

        if (entryData.password) {
            newEntry.password = entryData.password;
        }

        const docRef = await addDoc(journalCollection, newEntry);
        revalidatePath("/dashboard/journal");
        
        const savedEntry: JournalEntry = {
          id: docRef.id,
          content: entryData.content,
          timestamp: new Date(entryData.timestamp).toISOString(),
          password: newEntry.password,
          isUnlocked: !newEntry.password,
        };
        
        return savedEntry;

    } catch (error) {
        console.error("[saveJournalEntry] Error saving entry:", error);
        throw new Error("Could not save journal entry.");
    }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
    const session = await getSession();
    if (!session?.uid) {
        throw new Error("User not authenticated.");
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
