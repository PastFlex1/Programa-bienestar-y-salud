"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-provider";

import { getRecommendationAction } from "@/app/actions";
import type { PersonalizedMeditationRecommendationsOutput } from "@/ai/flows/personalized-meditation-recommendations";
import { MeditationCard } from "./meditation-card";

const translations = {
  es: {
    title: "Sesión Personalizada",
    description: "Dinos cómo te sientes y te sugeriremos la meditación perfecta para ti.",
    moodLabel: "¿Cómo te sientes?",
    moodPlaceholder: "Selecciona tu estado de ánimo",
    moodStressed: "Estresado/a",
    moodAnxious: "Ansioso/a",
    moodHappy: "Feliz",
    moodTired: "Cansado/a",
    moodNeutral: "Neutral",
    timeLabel: "¿Qué hora es?",
    timePlaceholder: "Selecciona la hora del día",
    timeMorning: "Mañana",
    timeAfternoon: "Tarde",
    timeEvening: "Noche",
    timeNight: "Madrugada",
    submitButton: "Encontrar mi Sesión",
    loadingButton: "Generando...",
    errorTitle: "Falló la Recomendación",
    validationMood: "Por favor, selecciona tu estado de ánimo actual.",
    validationTime: "Por favor, selecciona la hora del día."
  },
  en: {
    title: "Personalized Session",
    description: "Tell us how you're feeling, and we'll suggest the perfect meditation for you.",
    moodLabel: "How are you feeling?",
    moodPlaceholder: "Select your mood",
    moodStressed: "Stressed",
    moodAnxious: "Anxious",
    moodHappy: "Happy",
    moodTired: "Tired",
    moodNeutral: "Neutral",
    timeLabel: "What time is it?",
    timePlaceholder: "Select time of day",
    timeMorning: "Morning",
    timeAfternoon: "Afternoon",
    timeEvening: "Evening",
    timeNight: "Night",
    submitButton: "Find My Session",
    loadingButton: "Generating...",
    errorTitle: "Recommendation Failed",
    validationMood: "Please select your current mood.",
    validationTime: "Please select the time of day."
  }
};


export function RecommendationForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PersonalizedMeditationRecommendationsOutput | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const formSchema = z.object({
    mood: z.string().min(1, t.validationMood),
    timeOfDay: z.string().min(1, t.validationTime),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "",
      timeOfDay: "",
    },
  });

  function onSubmit(values: FormValues) {
    setResult(null);
    startTransition(async () => {
      const response = await getRecommendationAction(values);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        toast({
          variant: "destructive",
          title: t.errorTitle,
          description: response.error,
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {t.title}
          </CardTitle>
          <CardDescription>
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.moodLabel}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.moodPlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Stressed">{t.moodStressed}</SelectItem>
                          <SelectItem value="Anxious">{t.moodAnxious}</SelectItem>
                          <SelectItem value="Happy">{t.moodHappy}</SelectItem>
                          <SelectItem value="Tired">{t.moodTired}</SelectItem>
                          <SelectItem value="Neutral">{t.moodNeutral}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeOfDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.timeLabel}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.timePlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Morning">{t.timeMorning}</SelectItem>
                          <SelectItem value="Afternoon">{t.timeAfternoon}</SelectItem>
                          <SelectItem value="Evening">{t.timeEvening}</SelectItem>
                          <SelectItem value="Night">{t.timeNight}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t.loadingButton}
                  </>
                ) : (
                  t.submitButton
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isPending && (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      )}

      {result && (
        <div className="animate-in fade-in-50 duration-500">
           <MeditationCard
              title={result.sessionTitle}
              description={result.sessionDescription}
              lengthMinutes={result.sessionLengthMinutes}
              type={result.meditationType}
              imageUrl="https://placehold.co/600x400.png"
              imageHint="abstract nature"
              isRecommended
            />
        </div>
      )}
    </div>
  );
}
