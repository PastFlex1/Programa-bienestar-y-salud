"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    title: "Progreso Semanal",
    description: "Mira cómo has crecido durante la última semana.",
    meditationMinutes: "Minutos de Meditación",
    habitsCompleted: "Hábitos Completados",
    chartMinutes: "Minutos",
    chartHabits: "Hábitos",
    days: { mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom" },
  },
  en: {
    title: "Weekly Progress",
    description: "See how you've grown over the last week.",
    meditationMinutes: "Meditation Minutes",
    habitsCompleted: "Habits Completed",
    chartMinutes: "Minutes",
    chartHabits: "Habits",
    days: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" },
  }
};


export function ProgressCharts() {
  const { language } = useLanguage();
  const t = translations[language];

  const chartData = [
    { day: t.days.mon, minutes: 10, habits: 2 },
    { day: t.days.tue, minutes: 15, habits: 1 },
    { day: t.days.wed, minutes: 12, habits: 3 },
    { day: t.days.thu, minutes: 20, habits: 2 },
    { day: t.days.fri, minutes: 25, habits: 3 },
    { day: t.days.sat, minutes: 30, habits: 3 },
    { day: t.days.sun, minutes: 20, habits: 2 },
  ];

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
                  tickFormatter={(value) => value.slice(0, 3)}
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
                  tickFormatter={(value) => value.slice(0, 3)}
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
