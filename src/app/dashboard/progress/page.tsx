
"use client";

import { ProgressCharts } from "@/components/progress-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/language-provider";
import { useProgress } from "@/context/progress-provider";
import { useEffect } from "react";
import { getProgressDataForPastWeek } from "@/lib/firebase/progress";

const translations = {
  es: {
    title: "Tu Progreso",
    description: "Visualiza tu viaje y celebra tus logros.",
    content: "Tus estadísticas de meditación y rachas de hábitos se muestran aquí."
  },
  en: {
    title: "Your Progress",
    description: "Visualize your journey and celebrate your achievements.",
    content: "Your meditation stats and habit streaks are displayed here."
  }
};


export default function ProgressPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { setInitialProgress } = useProgress();

  useEffect(() => {
    getProgressDataForPastWeek().then(data => {
      setInitialProgress(data);
    });
  }, [setInitialProgress]);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t.content}</p>
          </CardContent>
        </Card>
        <ProgressCharts />
      </div>
    </div>
  );
}
