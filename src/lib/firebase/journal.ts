
"use server";

import { collection, doc, setDoc, updateDoc, arrayUnion, getDoc, arrayRemove } from "firebase/firestore";
import { db } from "./config";
import { revalidatePath } from "next/cache";

export interface JournalEntry {
    date: string;
    entry: string;
    analysis?: {
        summary: string;
        analysis: string;
        advice: string;
    };
}

// Firestore collection reference
const journalCollection = collection(db, "journal");

export async function saveJournalEntry(entry: JournalEntry, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const userJournalDocRef = doc(journalCollection, userId);

    try {
        const docSnap = await getDoc(userJournalDocRef);

        const newEntryWithDate = {
            ...entry,
            date: entry.date || new Date().toISOString(),
        };

        if (docSnap.exists()) {
            await updateDoc(userJournalDocRef, {
                entries: arrayUnion(newEntryWithDate)
            });
        } else {
            await setDoc(userJournalDocRef, {
                entries: [newEntryWithDate]
            });
        }
    } catch (error) {
        console.error("Error saving journal entry:", error);
        throw new Error("Could not save journal entry.");
    }
    
    revalidatePath("/dashboard/journal");
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
    if (!userId) {
        console.warn("User not authenticated, returning empty entries.");
        return [];
    }

    const userJournalDocRef = doc(journalCollection, userId);

    try {
        const docSnap = await getDoc(userJournalDocRef);
        if (docSnap.exists() && docSnap.data().entries) {
            const entries = docSnap.data().entries as JournalEntry[];
            return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return [];
    }
}

export async function deleteJournalEntry(entryToDelete: JournalEntry, userId: string) {
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const userJournalDocRef = doc(journalCollection, userId);

    try {
        await updateDoc(userJournalDocRef, {
            entries: arrayRemove(entryToDelete)
        });
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        throw new Error("Could not delete journal entry.");
    }
    
    revalidatePath("/dashboard/journal");
}
