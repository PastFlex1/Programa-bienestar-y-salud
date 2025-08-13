
"use server";

import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
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
    const path = `users/${userId}/journal`;
    return collection(db, path);
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    const session = await getSession();
    if (!session) {
        return [];
    }

    try {
        const journalCollection = getJournalCollectionRef(session.uid);
        const q = query(journalCollection, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        const entries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
                id: doc.id,
                content: data.content,
                timestamp: data.timestamp.toDate().toISOString(),
                password: data.password,
            });
        });
        
        return entries;
    } catch (error) {
        console.error("[getJournalEntries] Error fetching entries:", error);
        return [];
    }
}

export async function saveJournalEntry(entryData: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated. Cannot save entry.");
    }
    
    try {
        const journalCollection = getJournalCollectionRef(session.uid);
        
        const newEntry: any = {
            content: entryData.content,
            timestamp: new Date(entryData.timestamp),
        };

        if (entryData.password) {
            newEntry.password = entryData.password;
        }

        const docRef = await addDoc(journalCollection, newEntry);
        revalidatePath("/dashboard/journal");
        return { ...entryData, id: docRef.id };

    } catch (error) {
        console.error("[saveJournalEntry] Error saving entry:", error);
        throw new Error("Could not save journal entry.");
    }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
    const session = await getSession();
    if (!session) {
        return;
    }

    try {
        const entryRef = doc(db, `users/${session.uid}/journal/${entryId}`);
        await deleteDoc(entryRef);
        revalidatePath("/dashboard/journal");
    } catch(error) {
        console.error("[deleteJournalEntry] Error deleting entry:", error);
        throw new Error("Could not delete journal entry.");
    }
}
