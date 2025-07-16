"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

const chartData = [
  { day: "Lun", minutes: 10, habits: 2 },
  { day: "Mar", minutes: 15, habits: 1 },
  { day: "Mié", minutes: 12, habits: 3 },
  { day: "Jue", minutes: 20, habits: 2 },
  { day: "Vie", minutes: 25, habits: 3 },
  { day: "Sáb", minutes: 30, habits: 3 },
  { day: "Dom", minutes: 20, habits: 2 },
];

const chartConfig = {
  minutes: {
    label: "Minutos",
    color: "hsl(var(--chart-1))",
  },
  habits: {
    label: "Hábitos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ProgressCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Progreso Semanal
        </CardTitle>
        <CardDescription>Mira cómo has crecido durante la última semana.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold font-headline mb-2 text-center">Minutos de Meditación</h3>
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
            <h3 className="text-lg font-semibold font-headline mb-2 text-center">Hábitos Completados</h3>
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
