
'use server';
/**
 * @fileOverview An AI flow for analyzing journal entries.
 *
 * - analyzeJournalEntry - A function that analyzes a journal entry.
 * - JournalAnalysisInput - The input type for the analyzeJournalEntry function.
 * - JournalAnalysis - The return type for the analyzeJournalEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const JournalAnalysisInputSchema = z.object({
  journalEntry: z.string().describe('The user-written journal entry text.'),
});
export type JournalAnalysisInput = z.infer<typeof JournalAnalysisInputSchema>;

export const JournalAnalysisSchema = z.object({
  summary: z.string().describe('A concise, one or two-sentence summary of the journal entry.'),
  analysis: z.string().describe('A compassionate and insightful analysis of the key themes, emotions, and patterns in the entry.'),
  advice: z.string().describe('A single, practical, and actionable piece of advice or a reflective question based on the analysis.'),
});
export type JournalAnalysis = z.infer<typeof JournalAnalysisSchema>;

// Define the prompt for the journal analysis
const journalAnalysisPrompt = ai.definePrompt({
    name: 'journalAnalysisPrompt',
    input: { schema: JournalAnalysisInputSchema },
    output: { schema: JournalAnalysisSchema },
    prompt: `You are a compassionate and insightful journaling assistant.
    Your role is to analyze the user's journal entry with empathy and provide helpful feedback.
    
    Analyze the following journal entry:
    "{{{journalEntry}}}"

    Based on the entry, provide the following:
    1.  A brief summary of the main points.
    2.  A thoughtful analysis of the underlying emotions and themes.
    3.  A single, practical piece of advice or a question for further reflection.

    Your tone should be supportive, non-judgmental, and encouraging.
    `,
});

// Define the main flow for journal analysis
const journalAnalysisFlow = ai.defineFlow(
  {
    name: 'journalAnalysisFlow',
    inputSchema: JournalAnalysisInputSchema,
    outputSchema: JournalAnalysisSchema,
  },
  async (input) => {
    const { output } = await journalAnalysisPrompt(input);
    return output!;
  }
);


export async function analyzeJournalEntry(input: JournalAnalysisInput): Promise<JournalAnalysis> {
    return await journalAnalysisFlow(input);
}
