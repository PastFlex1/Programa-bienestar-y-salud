
"use client";

import * as React from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/language-provider";
import { useProgress } from "@/context/progress-provider";
import { startOfWeek, format } from "date-fns";

const translations = {
  es: {
    title: "Progreso Semanal",
    description: "Mira cómo has crecido durante la última semana.",
    meditationMinutes: "Minutos de Meditación",
    habitsCompleted: "Hábitos Completados",
    chartMinutes: "Minutos",
    chartHabits: "Hábitos",
  },
  en: {
    title: "Weekly Progress",
    description: "See how you've grown over the last week.",
    meditationMinutes: "Meditation Minutes",
    habitsCompleted: "Habits Completed",
    chartMinutes: "Minutes",
    chartHabits: "Habits",
  }
};


export function ProgressCharts() {
  const { language } = useLanguage();
  const { progressData } = useProgress();
  const t = translations[language];

  const chartData = React.useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    
    const dayLabels = {
        en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    };

    const daysOfWeek = dayLabels[language];

    return daysOfWeek.map((dayLabel, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayData = progressData[dateKey] || { minutes: 0, habits: 0 };

        return {
            day: dayLabel,
            minutes: dayData.minutes,
            habits: dayData.habits
        };
    });
  }, [progressData, language]);


  const chartConfig = {
    minutes: {
      label: t.chartMinutes,
      color: "hsl(var(--chart-1))",
    },
    habits: {
      label: t.chartHabits,
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;
  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold font-headline mb-2 text-center">{t.meditationMinutes}</h3>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="minutes" fill="var(--color-minutes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold font-headline mb-2 text-center">{t.habitsCompleted}</h3>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="habits" fill="var(--color-habits)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
