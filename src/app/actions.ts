
'use server';

import { getPersonalizedMeditationRecommendations, type PersonalizedMeditationRecommendationsInput } from "@/ai/flows/personalized-meditation-recommendations";

export async function getRecommendationAction(input: PersonalizedMeditationRecommendationsInput) {
  try {
    const recommendation = await getPersonalizedMeditationRecommendations(input);
    return { success: true, data: recommendation };
  } catch (error) {
    console.error(error);
    // It's better to return a generic error message to the client.
    return { success: false, error: "Sorry, we couldn't generate a recommendation at this time. Please try again later." };
  }
}
