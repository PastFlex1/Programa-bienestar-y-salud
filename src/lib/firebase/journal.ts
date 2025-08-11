
"use server";

import { collection, doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "./config";
import { getSession } from "./auth";
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

export async function saveJournalEntry(entry: JournalEntry) {
    const session = await getSession();
    if (!session?.email) {
        throw new Error("User not authenticated");
    }

    const userJournalDocRef = doc(journalCollection, session.email);

    try {
        const docSnap = await getDoc(userJournalDocRef);

        if (docSnap.exists()) {
            // If the user document exists, add the new entry to the 'entries' array.
            await updateDoc(userJournalDocRef, {
                entries: arrayUnion(entry)
            });
        } else {
            // If the user document doesn't exist, create it with the first entry.
            await setDoc(userJournalDocRef, {
                entries: [entry]
            });
        }
    } catch (error) {
        console.error("Error saving journal entry:", error);
        throw new Error("Could not save journal entry.");
    }
    
    revalidatePath("/dashboard/journal");
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    const session = await getSession();
    if (!session?.email) {
        console.warn("User not authenticated, returning empty entries.");
        return [];
    }

    const userJournalDocRef = doc(journalCollection, session.email);

    try {
        const docSnap = await getDoc(userJournalDocRef);
        if (docSnap.exists() && docSnap.data().entries) {
            // Firestore returns entries, which might not be sorted. Sort them by date descending.
            const entries = docSnap.data().entries as JournalEntry[];
            return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return []; // Return empty array on error
    }
}
