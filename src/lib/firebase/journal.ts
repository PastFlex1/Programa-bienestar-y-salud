
"use server";

import { ref, get, set, push, remove } from "firebase/database";
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


const getJournalRef = (userId: string) => {
    const path = `users/${userId}/journal`;
    return ref(db, path);
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    const session = await getSession();
    if (!session) return [];

    try {
        const journalRef = getJournalRef(session.uid);
        const snapshot = await get(journalRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // Convert object of entries into an array
            const entries = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
            }));
            // Sort by timestamp descending
            return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } else {
            return [];
        }
    } catch (error) {
        console.error("[getJournalEntries] Error fetching entries:", error);
        return [];
    }
}

export async function saveJournalEntry(entryData: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    const session = await getSession();
    if (!session) {
        throw new Error("User is not authenticated.");
    }
    
    try {
        const journalRef = getJournalRef(session.uid);
        const newEntryRef = push(journalRef); // Generate a new unique key
        
        const newEntry: Omit<JournalEntry, 'id'> = {
            content: entryData.content,
            timestamp: entryData.timestamp,
        };

        if (entryData.password) {
            newEntry.password = entryData.password;
        }

        await set(newEntryRef, newEntry);

        revalidatePath("/dashboard/journal");

        return { ...newEntry, id: newEntryRef.key! };

    } catch (error) {
        console.error("[saveJournalEntry] Error saving entry:", error);
        throw new Error("Could not save journal entry.");
    }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
    const session = await getSession();
    if (!session) {
        throw new Error("User is not authenticated.");
    }

    try {
        const entryRef = ref(db, `users/${session.uid}/journal/${entryId}`);
        await remove(entryRef);
        revalidatePath("/dashboard/journal");
    } catch(error) {
        console.error("[deleteJournalEntry] Error deleting entry:", error);
        throw new Error("Could not delete journal entry.");
    }
}
