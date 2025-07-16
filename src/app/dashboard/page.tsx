"use client";

import { MeditationCard } from "@/components/meditation-card";
import { RecommendationForm } from "@/components/recommendation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    exploreTitle: "Explorar Sesiones",
    exploreDescription: "Encuentra la meditación perfecta para cada momento de tu día.",
    searchPlaceholder: "Buscar por nombre o tema...",
    badgeAll: "Todo",
    badgeStress: "Estrés",
    badgeSleep: "Sueño",
    badgeFocus: "Enfoque",
    badgeAnxiety: "Ansiedad",
    sectionForYou: "Para Empezar",
    sectionDeepRelax: "Relajación Profunda",
    sectionConcentration: "Concentración",
    morningAwakeningTitle: "Despertar Matutino",
    morningAwakeningDesc: "Comienza tu día con claridad y enfoque. Una sesión suave para despertar los sentidos.",
    deepSleepTitle: "Sueño Profundo",
    deepSleepDesc: "Un viaje relajante para liberar la tensión del día y dar la bienvenida a un sueño reparador.",
    stressReliefTitle: "Alivio del Estrés",
    stressReliefDesc: "Encuentra tu calma interior y reduce el estrés con esta sesión guiada de respiración.",
    intenseFocusTitle: "Foco Intenso",
    intenseFocusDesc: "Mejora tu concentración y productividad con esta meditación para la claridad mental."
  },
  en: {
    exploreTitle: "Explore Sessions",
    exploreDescription: "Find the perfect meditation for every moment of your day.",
    searchPlaceholder: "Search by name or topic...",
    badgeAll: "All",
    badgeStress: "Stress",
    badgeSleep: "Sleep",
    badgeFocus: "Focus",
    badgeAnxiety: "Anxiety",
    sectionForYou: "For You",
    sectionDeepRelax: "Deep Relaxation",
    sectionConcentration: "Concentration",
    morningAwakeningTitle: "Morning Awakening",
    morningAwakeningDesc: "Start your day with clarity and focus. A gentle session to awaken the senses.",
    deepSleepTitle: "Deep Sleep",
    deepSleepDesc: "A relaxing journey to release the day's tension and welcome a restful sleep.",
    stressReliefTitle: "Stress Relief",
    stressReliefDesc: "Find your inner calm and reduce stress with this guided breathing session.",
    intenseFocusTitle: "Intense Focus",
    intenseFocusDesc: "Improve your concentration and productivity with this meditation for mental clarity."
  }
};


export default function DashboardPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <RecommendationForm />
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t.exploreTitle}</CardTitle>
            <CardDescription>{t.exploreDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder={t.searchPlaceholder} className="pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{t.badgeAll}</Badge>
                <Badge variant="outline">{t.badgeStress}</Badge>
                <Badge variant="outline">{t.badgeSleep}</Badge>
                <Badge variant="outline">{t.badgeFocus}</Badge>
                <Badge variant="outline">{t.badgeAnxiety}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl font-headline font-bold">{t.sectionForYou}</h2>
        <MeditationCard
          title={t.morningAwakeningTitle}
          description={t.morningAwakeningDesc}
          lengthMinutes={10}
          type="Mindfulness"
          imageUrl="https://placehold.co/600x400.png"
          imageHint="sunrise yoga"
        />
        <h2 className="text-2xl font-headline font-bold mt-8">{t.sectionDeepRelax}</h2>
        <MeditationCard
          title={t.deepSleepTitle}
          description={t.deepSleepDesc}
          lengthMinutes={20}
          type="Sueño"
          imageUrl="https://placehold.co/600x400.png"
          imageHint="calm night"
        />
        <MeditationCard
          title={t.stressReliefTitle}
          description={t.stressReliefDesc}
          lengthMinutes={15}
          type="Estrés"
          imageUrl="https://placehold.co/600x400.png"
          imageHint="serene forest"
        />
        <h2 className="text-2xl font-headline font-bold mt-8">{t.sectionConcentration}</h2>
        <MeditationCard
          title={t.intenseFocusTitle}
          description={t.intenseFocusDesc}
          lengthMinutes={12}
          type="Enfoque"
          imageUrl="https://placehold.co/600x400.png"
          imageHint="focused work"
        />
      </div>
    </div>
  );
}
