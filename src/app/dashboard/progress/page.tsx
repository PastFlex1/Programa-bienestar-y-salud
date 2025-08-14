
"use client";

import { ProgressCharts } from "@/components/progress-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/language-provider";
import { useProgress } from "@/context/progress-provider";
import { useEffect, useState } from "react";
import { getProgressDataForPastWeek } from "@/lib/firebase/progress";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-provider";

const translations = {
  es: {
    title: "Tu Progreso",
    description: "Visualiza tu viaje y celebra tus logros.",
    content: "Tus estadísticas de meditación y rachas de hábitos se muestran aquí.",
    loading: "Cargando datos de progreso..."
  },
  en: {
    title: "Your Progress",
    description: "Visualize your journey and celebrate your achievements.",
    content: "Your meditation stats and habit streaks are displayed here.",
    loading: "Loading progress data..."
  }
};


export default function ProgressPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { progressData, setInitialProgress } = useProgress();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    function loadData() {
        setIsLoading(true);
        getProgressDataForPastWeek(user!.id).then(data => {
            if(isMounted) {
                setInitialProgress(data);
                setIsLoading(false);
            }
        });
    }
    
    loadData();

    return () => { isMounted = false; }
  }, [setInitialProgress, user]);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
           <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.loading}</span>
              </div>
            ) : (
               <p>{t.content}</p>
            )}
           </CardContent>
        </Card>
        {isLoading ? (
          <Card className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : (
          <ProgressCharts chartData={progressData} />
        )}
      </div>
    </div>
  );
}
