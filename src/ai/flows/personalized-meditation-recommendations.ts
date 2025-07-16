// src/ai/flows/personalized-meditation-recommendations.ts
'use server';
/**
 * @fileOverview Provides personalized meditation session recommendations based on user mood and time of day.
 *
 * - getPersonalizedMeditationRecommendations - A function that returns personalized meditation recommendations.
 * - PersonalizedMeditationRecommendationsInput - The input type for the getPersonalizedMeditationRecommendations function.
 * - PersonalizedMeditationRecommendationsOutput - The return type for the getPersonalizedMeditationRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedMeditationRecommendationsInputSchema = z.object({
  mood: z
    .string()
    .describe("The user's current mood (e.g., happy, stressed, anxious)."),
  timeOfDay: z
    .string()
    .describe('The current time of day (e.g., morning, afternoon, evening).'),
});
export type PersonalizedMeditationRecommendationsInput = z.infer<
  typeof PersonalizedMeditationRecommendationsInputSchema
>;

const PersonalizedMeditationRecommendationsOutputSchema = z.object({
  sessionTitle: z.string().describe('The title of the recommended meditation session.'),
  sessionDescription: z
    .string()
    .describe('A brief description of the recommended meditation session.'),
  sessionLengthMinutes: z
    .number()
    .describe('The recommended session length in minutes.'),
  meditationType: z.string().describe('The type of meditation (e.g., mindfulness, sleep).'),
});

export type PersonalizedMeditationRecommendationsOutput = z.infer<
  typeof PersonalizedMeditationRecommendationsOutputSchema
>;

export async function getPersonalizedMeditationRecommendations(
  input: PersonalizedMeditationRecommendationsInput
): Promise<PersonalizedMeditationRecommendationsOutput> {
  return personalizedMeditationRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedMeditationRecommendationsPrompt',
  input: {schema: PersonalizedMeditationRecommendationsInputSchema},
  output: {schema: PersonalizedMeditationRecommendationsOutputSchema},
  prompt: `Based on the user's current mood of {{mood}} and the time of day being {{timeOfDay}},
  recommend a personalized meditation session. Provide the session title, a brief description,
  the session length in minutes, and the type of meditation that would be most suitable.

  Ensure the recommendation is tailored to enhance their meditation experience and fit their current needs.
`,
});

const personalizedMeditationRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedMeditationRecommendationsFlow',
    inputSchema: PersonalizedMeditationRecommendationsInputSchema,
    outputSchema: PersonalizedMeditationRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
