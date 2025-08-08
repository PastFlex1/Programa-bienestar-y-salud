"use client";

import { useState } from "react";
import { MeditationSection } from "@/components/meditation-section";
import { RecommendationForm } from "@/components/recommendation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import type { MeditationSession } from "@/components/meditation-section";
import { Button } from "@/components/ui/button";

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
    resetFilter: "Mostrar Todo",
    noResults: "No se encontraron sesiones que coincidan con tu búsqueda.",
    sections: {
      stressRelief: "Alivio del Estrés",
      deepSleep: "Sueño Profundo",
      intenseFocus: "Enfoque Intenso",
      anxietyReduction: "Reducción de Ansiedad",
      morningStart: "Para Empezar el Día",
      unwindEvening: "Para Relajarse en la Noche",
      walkingMeditation: "Meditación Caminando",
      bodyScan: "Escaneo Corporal",
      focusAndRelax: "Foco y Relajación",
      stressAndSleep: "Estrés y Sueño",
    }
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
    resetFilter: "Show All",
    noResults: "No sessions found matching your search.",
    sections: {
      stressRelief: "Stress Relief",
      deepSleep: "Deep Sleep",
      intenseFocus: "Intense Focus",
      anxietyReduction: "Anxiety Reduction",
      morningStart: "Morning Start",
      unwindEvening: "Evening Unwind",
      walkingMeditation: "Walking Meditation",
      bodyScan: "Body Scan",
      focusAndRelax: "Focus & Relaxation",
      stressAndSleep: "Stress & Sleep",
    }
  }
};

const sessionsData: { [key: string]: MeditationSession[] } = {
  stressRelief: [
    { title: { es: "Calma Rápida", en: "Quick Calm" }, description: { es: "5 minutos para liberar tensión.", en: "5 minutes to release tension." }, lengthMinutes: 5, type: { es: "Estrés", en: "Stress" }, imageUrl: "/alivioestres/estres1.png", imageHint: "serene lake", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Respiración Consciente", en: "Mindful Breathing" }, description: { es: "10 minutos de respiración para el estrés.", en: "10 minutes of breathing for stress." }, lengthMinutes: 10, type: { es: "Estrés", en: "Stress" }, imageUrl: "/alivioestres/estres2.png", imageHint: "person meditating", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Pausa Relajante", en: "Relaxing Pause" }, description: { es: "Una pausa de 15 minutos en tu día.", en: "A 15-minute break in your day." }, lengthMinutes: 15, type: { es: "Estrés", en: "Stress" }, imageUrl: "/alivioestres/estres3.jpg", imageHint: "calm waves", audioUrl: "/audio/meditacion.mp3" },
  ],
  deepSleep: [
    { title: { es: "Viaje al Sueño", en: "Journey to Sleep" }, description: { es: "20 minutos para un descanso profundo.", en: "20 minutes for a deep rest." }, lengthMinutes: 20, type: { es: "Sueño", en: "Sleep" }, imageUrl: "/sueño/sueño1.png", imageHint: "starry night", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Noche Serena", en: "Serene Night" }, description: { es: "Música y guía para dormir.", en: "Music and guidance for sleep." }, lengthMinutes: 30, type: { es: "Sueño", en: "Sleep" }, imageUrl: "/sueño/sueño2.png", imageHint: "moonlit forest", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Relajación Nocturna", en: "Nightly Relaxation" }, description: { es: "Libera el día antes de dormir.", en: "Release the day before sleeping." }, lengthMinutes: 15, type: { es: "Sueño", en: "Sleep" }, imageUrl: "/sueño/sueño3.png", imageHint: "cozy bedroom", audioUrl: "/audio/meditacion.mp3" },
  ],
  intenseFocus: [
    { title: { es: "Claridad Mental", en: "Mental Clarity" }, description: { es: "10 minutos para una mente aguda.", en: "10 minutes for a sharp mind." }, lengthMinutes: 10, type: { es: "Enfoque", en: "Focus" }, imageUrl: "/enfoque/enfoque1.png", imageHint: "focused work", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Concentración Total", en: "Total Concentration" }, description: { es: "15 minutos para eliminar distracciones.", en: "15 minutes to eliminate distractions." }, lengthMinutes: 15, type: { es: "Enfoque", en: "Focus" }, imageUrl: "/enfoque/enfoque2.png", imageHint: "geometric patterns", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Potencia tu Productividad", en: "Boost Your Productivity" }, description: { es: "Un impulso de 20 minutos para tu trabajo.", en: "A 20-minute boost for your work." }, lengthMinutes: 20, type: { es: "Enfoque", en: "Focus" }, imageUrl: "/enfoque/enfoque3.png", imageHint: "light bulb", audioUrl: "/audio/meditacion.mp3" },
  ],
  anxietyReduction: [
    { title: { es: "Paz Interior", en: "Inner Peace" }, description: { es: "Encuentra la calma en 10 minutos.", en: "Find calm in 10 minutes." }, lengthMinutes: 10, type: { es: "Ansiedad", en: "Anxiety" }, imageUrl: "/ansiedad/ansiedad1.jpg", imageHint: "zen garden", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Anclaje en el Presente", en: "Anchor in the Present" }, description: { es: "15 minutos para conectar con el ahora.", en: "15 minutes to connect with the now." }, lengthMinutes: 15, type: { es: "Ansiedad", en: "Anxiety" }, imageUrl: "/ansiedad/ansiedad2.png", imageHint: "person sitting", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Suelta la Preocupación", en: "Let Go of Worry" }, description: { es: "Una sesión de 20 minutos para liberarte.", en: "A 20-minute session to free yourself." }, lengthMinutes: 20, type: { es: "Ansiedad", en: "Anxiety" }, imageUrl: "/ansiedad/ansiedad3.png", imageHint: "dandelion seeds", audioUrl: "/audio/meditacion.mp3" },
  ],
   morningStart: [
    { title: { es: "Despertar Matutino", en: "Morning Awakening" }, description: { es: "Comienza tu día con claridad y enfoque.", en: "Start your day with clarity and focus." }, lengthMinutes: 10, type: { es: "Mindfulness", en: "Mindfulness" }, imageUrl: "/cocentracion/concentracion1.jpg", imageHint: "sunrise yoga", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Energía Positiva", en: "Positive Energy" }, description: { es: "Una sesión de 5 minutos para un gran día.", en: "A 5-minute session for a great day." }, lengthMinutes: 5, type: { es: "Energía", en: "Energy" }, imageUrl: "/cocentracion/concentracion2.jpg", imageHint: "sunflower field", audioUrl: "/audio/meditacion.mp3" },
  ],
  unwindEvening: [
    { title: { es: "Final del Día", en: "End of Day" }, description: { es: "Desconecta y relájate en 15 minutos.", en: "Disconnect and relax in 15 minutes." }, lengthMinutes: 15, type: { es: "Relajación", en: "Relaxation" }, imageUrl: "/sueño/sueño4.jpg", imageHint: "sunset view", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Pausa Nocturna", en: "Evening Pause" }, description: { es: "Reflexiona y calma tu mente antes de dormir.", en: "Reflect and calm your mind before sleep." }, lengthMinutes: 10, type: { es: "Calma", en: "Calm" }, imageUrl: "/sueño/sueño5.jpg", imageHint: "cup of tea", audioUrl: "/audio/meditacion.mp3" },
  ],
  walkingMeditation: [
    { title: { es: "Paseo Consciente", en: "Mindful Walk" }, description: { es: "Conecta con cada paso que das.", en: "Connect with every step you take." }, lengthMinutes: 20, type: { es: "Caminar", en: "Walking" }, imageUrl: "/cocentracion/concentracion3.jpg", imageHint: "forest path", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Caminata Urbana", en: "Urban Walk" }, description: { es: "Encuentra la paz en la ciudad.", en: "Find peace in the city." }, lengthMinutes: 15, type: { es: "Caminar", en: "Walking" }, imageUrl: "/cocentracion/concentracion4.jpg", imageHint: "city park", audioUrl: "/audio/meditacion.mp3" },
  ],
  bodyScan: [
    { title: { es: "Escaneo Corporal Profundo", en: "Deep Body Scan" }, description: { es: "25 minutos de conexión con tu cuerpo.", en: "25 minutes of connection with your body." }, lengthMinutes: 25, type: { es: "Escaneo Corporal", en: "Body Scan" }, imageUrl: "/cocentracion/concentracion5.jpg", imageHint: "human anatomy", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Relajación de Pies a Cabeza", en: "Head to Toe Relaxation" }, description: { es: "Libera la tensión acumulada.", en: "Release accumulated tension." }, lengthMinutes: 15, type: { es: "Escaneo Corporal", en: "Body Scan" }, imageUrl: "/cocentracion/concentracion6.jpg", imageHint: "person stretching", audioUrl: "/audio/meditacion.mp3" },
  ],
  focusAndRelax: [
    { title: { es: "Foco Relajado", en: "Relaxed Focus" }, description: { es: "Encuentra tu centro para trabajar mejor.", en: "Find your center to work better." }, lengthMinutes: 15, type: { es: "Foco/Relax", en: "Focus/Relax" }, imageUrl: "/cocentracion/concentracion7.jpg", imageHint: "zen office", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Calma y Concentración", en: "Calm and Concentration" }, description: { es: "El equilibrio perfecto para tu mente.", en: "The perfect balance for your mind." }, lengthMinutes: 20, type: { es: "Foco/Relax", en: "Focus/Relax" }, imageUrl: "/cocentracion/concentracion8.jpg", imageHint: "stack of stones", audioUrl: "/audio/meditacion.mp3" },
  ],
  stressAndSleep: [
    { title: { es: "Adiós Estrés, Hola Sueño", en: "Goodbye Stress, Hello Sleep" }, description: { es: "Prepara tu mente para un sueño reparador.", en: "Prepare your mind for a restful sleep." }, lengthMinutes: 18, type: { es: "Estrés/Sueño", en: "Stress/Sleep" }, imageUrl: "/sueño/sueño6.png", imageHint: "calm clouds", audioUrl: "/audio/meditacion.mp3" },
    { title: { es: "Liberación Nocturna", en: "Nightly Release" }, description: { es: "Suelta las preocupaciones del día.", en: "Let go of the day's worries." }, lengthMinutes: 12, type: { es: "Estrés/Sueño", en: "Stress/Sleep" }, imageUrl: "/sueño/sueño7.png", imageHint: "dream catcher", audioUrl: "/audio/meditacion.mp3" },
  ],
};

const allSections = [
  { id: 'stressRelief', category: 'Stressed' },
  { id: 'deepSleep', category: 'Tired' },
  { id: 'intenseFocus', category: 'Focus' },
  { id: 'anxietyReduction', category: 'Anxious' },
  { id: 'morningStart', category: 'Focus' },
  { id: 'unwindEvening', category: 'Tired' },
  { id: 'walkingMeditation', category: 'Stressed' },
  { id: 'bodyScan', category: 'Anxious' },
  { id: 'focusAndRelax', category: 'Focus' },
  { id: 'stressAndSleep', category: 'Stressed' },
];

export default function DashboardPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilter = (mood: string) => {
    setMoodFilter(mood);
  };

  const handleResetFilter = () => {
    setMoodFilter(null);
  }

  const filteredSections = moodFilter
    ? allSections.filter(section => section.category === moodFilter)
    : allSections;

  const sectionsWithFilteredSessions = filteredSections.map(sectionInfo => {
    const filteredSessionsData = sessionsData[sectionInfo.id].filter(session => {
        const query = searchQuery.toLowerCase();
        const title = session.title[language].toLowerCase();
        const description = session.description[language].toLowerCase();
        return title.includes(query) || description.includes(query);
    });

    return {
        ...sectionInfo,
        sessions: filteredSessionsData,
    };
  }).filter(section => section.sessions.length > 0);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <RecommendationForm onFilter={handleFilter} />
      </div>

      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t.exploreTitle}</CardTitle>
            <CardDescription>{t.exploreDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder={t.searchPlaceholder} 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={moodFilter === null ? "default" : "outline"} onClick={() => setMoodFilter(null)} className="cursor-pointer">{t.badgeAll}</Badge>
                <Badge variant={moodFilter === 'Stressed' ? "default" : "outline"} onClick={() => setMoodFilter('Stressed')} className="cursor-pointer">{t.badgeStress}</Badge>
                <Badge variant={moodFilter === 'Tired' ? "default" : "outline"} onClick={() => setMoodFilter('Tired')} className="cursor-pointer">{t.badgeSleep}</Badge>
                <Badge variant={moodFilter === 'Focus' ? "default" : "outline"} onClick={() => setMoodFilter('Focus')} className="cursor-pointer">{t.badgeFocus}</Badge>
                <Badge variant={moodFilter === 'Anxious' ? "default" : "outline"} onClick={() => setMoodFilter('Anxious')} className="cursor-pointer">{t.badgeAnxiety}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {moodFilter && (
          <div className="text-center">
            <Button onClick={handleResetFilter}>{t.resetFilter}</Button>
          </div>
        )}
        
        {sectionsWithFilteredSessions.map(sectionInfo => (
            <MeditationSection 
              key={sectionInfo.id} 
              title={t.sections[sectionInfo.id as keyof typeof t.sections]} 
              sessions={sectionInfo.sessions} 
            />
        ))}

        {sectionsWithFilteredSessions.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <p>{t.noResults}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
