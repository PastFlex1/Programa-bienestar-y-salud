
"use client";

import { z } from "zod";

const JournalEntrySchema = z.object({
    id: z.string(),
    content: z.string(),
    timestamp: z.string().datetime(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

const JournalDataSchema = z.array(JournalEntrySchema);

const STORAGE_KEY_PREFIX = "zenith-local-journal-";

function getAllEntries(userId: string): JournalEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const storedData = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
        if (!storedData) return [];
        return JournalDataSchema.parse(JSON.parse(storedData));
    } catch (error) {
        console.error("Failed to parse journal entries from localStorage:", error);
        return [];
    }
}

function saveAllEntries(userId: string, entries: JournalEntry[]): void {
    if (typeof window === "undefined") return;
    try {
        const sortedEntries = entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(sortedEntries));
    } catch (error) {
        console.error("Failed to save journal entries to localStorage:", error);
    }
}

export function getJournalEntries(userId: string): JournalEntry[] {
    return getAllEntries(userId);
}

export function saveJournalEntry(userId: string, entryData: { content: string }): JournalEntry {
    const allEntries = getAllEntries(userId);
    const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        content: entryData.content,
        timestamp: new Date().toISOString(),
    };
    const updatedEntries = [newEntry, ...allEntries];
    saveAllEntries(userId, updatedEntries);
    return newEntry;
}

export function deleteJournalEntry(userId: string, entryId: string): void {
    const allEntries = getAllEntries(userId);
    const updatedEntries = allEntries.filter(entry => entry.id !== entryId);
    saveAllEntries(userId, updatedEntries);
}
