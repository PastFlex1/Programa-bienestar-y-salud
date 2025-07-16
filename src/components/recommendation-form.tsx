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

import { getRecommendationAction } from "@/app/actions";
import type { PersonalizedMeditationRecommendationsOutput } from "@/ai/flows/personalized-meditation-recommendations";
import { MeditationCard } from "./meditation-card";

const formSchema = z.object({
  mood: z.string().min(1, "Por favor, selecciona tu estado de ánimo actual."),
  timeOfDay: z.string().min(1, "Por favor, selecciona la hora del día."),
});

type FormValues = z.infer<typeof formSchema>;

export function RecommendationForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PersonalizedMeditationRecommendationsOutput | null>(null);
  const { toast } = useToast();

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
          title: "Falló la Recomendación",
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
            Sesión Personalizada
          </CardTitle>
          <CardDescription>
            Dinos cómo te sientes y te sugeriremos la meditación perfecta para ti.
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
                      <FormLabel>¿Cómo te sientes?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu estado de ánimo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Stressed">Estresado/a</SelectItem>
                          <SelectItem value="Anxious">Ansioso/a</SelectItem>
                          <SelectItem value="Happy">Feliz</SelectItem>
                          <SelectItem value="Tired">Cansado/a</SelectItem>
                          <SelectItem value="Neutral">Neutral</SelectItem>
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
                      <FormLabel>¿Qué hora es?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona la hora del día" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Morning">Mañana</SelectItem>
                          <SelectItem value="Afternoon">Tarde</SelectItem>
                          <SelectItem value="Evening">Noche</SelectItem>
                          <SelectItem value="Night">Madrugada</SelectItem>
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
                    Generando...
                  </>
                ) : (
                  "Encontrar mi Sesión"
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
