"use client";

import { useState } from "react";
import { Reminders } from "@/components/reminders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("es");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Reminders />
        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
            <CardDescription>Personaliza tu experiencia en la aplicación.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between p-3 rounded-md">
                <Label htmlFor="theme" className="font-medium text-sm flex-1">Tema de la Aplicación</Label>
                <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar tema" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md">
                <Label htmlFor="language" className="font-medium text-sm flex-1">Idioma</Label>
                 <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
