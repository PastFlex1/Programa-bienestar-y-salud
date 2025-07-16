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
  sessionTitle: z.string().describe('El título de la sesión de meditación recomendada.'),
  sessionDescription: z
    .string()
    .describe('Una breve descripción de la sesión de meditación recomendada.'),
  sessionLengthMinutes: z
    .number()
    .describe('La duración recomendada de la sesión en minutos.'),
  meditationType: z.string().describe('El tipo de meditación (por ejemplo, mindfulness, sueño).'),
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
  prompt: `Basado en el estado de ánimo actual del usuario de {{mood}} y la hora del día siendo {{timeOfDay}},
  recomienda una sesión de meditación personalizada en español. Proporciona el título de la sesión, una breve descripción,
  la duración de la sesión en minutos y el tipo de meditación que sería más adecuado.

  Asegúrate de que la recomendación esté diseñada para mejorar su experiencia de meditación y se ajuste a sus necesidades actuales.
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
