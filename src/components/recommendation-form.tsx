
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";

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
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    title: "Sesión Personalizada",
    description: "Dinos cómo te sientes y te mostraremos las mejores meditaciones para ti.",
    moodLabel: "¿Cómo te sientes?",
    moodPlaceholder: "Selecciona tu estado de ánimo",
    moodStressed: "Estresado/a",
    moodAnxious: "Ansioso/a",
    moodHappy: "Feliz",
    moodTired: "Cansado/a",
    moodFocus: "Necesito Concentración",
    submitButton: "Encontrar mi Sesión",
    validationMood: "Por favor, selecciona tu estado de ánimo actual."
  },
  en: {
    title: "Personalized Session",
    description: "Tell us how you're feeling, and we'll show you the best meditations.",
    moodLabel: "How are you feeling?",
    moodPlaceholder: "Select your mood",
    moodStressed: "Stressed",
    moodAnxious: "Anxious",
    moodHappy: "Happy",
    moodTired: "Tired",
    moodFocus: "Need to Focus",
    submitButton: "Find My Session",
    validationMood: "Please select your current mood."
  }
};

interface RecommendationFormProps {
  onFilter: (mood: string) => void;
}

export function RecommendationForm({ onFilter }: RecommendationFormProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const formSchema = z.object({
    mood: z.string().min(1, t.validationMood),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "",
    },
  });

  function onSubmit(values: FormValues) {
    onFilter(values.mood);
  }

  return (
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
            <div className="grid grid-cols-1 gap-4">
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
                        <SelectItem value="Focus">{t.moodFocus}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              {t.submitButton}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
