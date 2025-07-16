"use client";

import { HabitTracker } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    title: "Seguimiento de Hábitos",
    description: "Construye una mejor versión de ti, un día a la vez.",
    content: "Aquí puedes ver y gestionar todos tus hábitos diarios, semanales y mensuales."
  },
  en: {
    title: "Habit Tracking",
    description: "Build a better you, one day at a time.",
    content: "Here you can view and manage all your daily, weekly, and monthly habits."
  }
};

export default function HabitsPage() {
  const { language } = useLanguage();
  const t = translations[language];

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
        <HabitTracker />
      </div>
    </div>
  );
}
