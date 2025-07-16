
'use server';

import { getPersonalizedMeditationRecommendations, type PersonalizedMeditationRecommendationsInput } from "@/ai/flows/personalized-meditation-recommendations";

export async function getRecommendationAction(input: PersonalizedMeditationRecommendationsInput) {
  try {
    const recommendation = await getPersonalizedMeditationRecommendations(input);
    return { success: true, data: recommendation };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Lo sentimos, no pudimos generar una recomendación en este momento. Por favor, inténtalo de nuevo más tarde." };
  }
}
