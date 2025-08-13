
"use client";

import { z } from "zod";

const JournalEntrySchema = z.object({
    id: z.string(),
    content: z.string(),
    timestamp: z.string().datetime(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

const JournalDataSchema = z.array(JournalEntrySchema);

const STORAGE_KEY = "zenith-local-journal";

function getAllEntries(): JournalEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) return [];
        return JournalDataSchema.parse(JSON.parse(storedData));
    } catch (error) {
        console.error("Failed to parse journal entries from localStorage:", error);
        return [];
    }
}

function saveAllEntries(entries: JournalEntry[]): void {
    if (typeof window === "undefined") return;
    try {
        const sortedEntries = entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedEntries));
    } catch (error) {
        console.error("Failed to save journal entries to localStorage:", error);
    }
}

export function getJournalEntries(): JournalEntry[] {
    return getAllEntries();
}

export function saveJournalEntry(entryData: { content: string }): JournalEntry {
    const allEntries = getAllEntries();
    const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        content: entryData.content,
        timestamp: new Date().toISOString(),
    };
    const updatedEntries = [newEntry, ...allEntries];
    saveAllEntries(updatedEntries);
    return newEntry;
}

export function deleteJournalEntry(entryId: string): void {
    const allEntries = getAllEntries();
    const updatedEntries = allEntries.filter(entry => entry.id !== entryId);
    saveAllEntries(updatedEntries);
}
