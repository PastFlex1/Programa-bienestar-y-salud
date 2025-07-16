"use client";

import * as React from "react";
import { Reminders } from "@/components/reminders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/context/theme-provider";
import { useLanguage } from "@/context/language-provider";

const translations = {
  es: {
    preferences: "Preferencias",
    preferencesDesc: "Personaliza tu experiencia en la aplicación.",
    appTheme: "Tema de la Aplicación",
    selectTheme: "Seleccionar tema",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    language: "Idioma",
    selectLanguage: "Seleccionar idioma",
    spanish: "Español",
    english: "Inglés",
  },
  en: {
    preferences: "Preferences",
    preferencesDesc: "Customize your in-app experience.",
    appTheme: "App Theme",
    selectTheme: "Select theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    language: "Language",
    selectLanguage: "Select language",
    spanish: "Spanish",
    english: "English",
  }
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Reminders />
        <Card>
          <CardHeader>
            <CardTitle>{t.preferences}</CardTitle>
            <CardDescription>{t.preferencesDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between p-3 rounded-md">
                <Label htmlFor="theme" className="font-medium text-sm flex-1">{t.appTheme}</Label>
                <Select value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t.selectTheme} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">{t.light}</SelectItem>
                        <SelectItem value="dark">{t.dark}</SelectItem>
                        <SelectItem value="system">{t.system}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md">
                <Label htmlFor="language" className="font-medium text-sm flex-1">{t.language}</Label>
                 <Select value={language} onValueChange={(value) => setLanguage(value as "es" | "en")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t.selectLanguage} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="es">{t.spanish}</SelectItem>
                        <SelectItem value="en">{t.english}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
