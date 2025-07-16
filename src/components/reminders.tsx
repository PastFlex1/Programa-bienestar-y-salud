import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BellRing } from "lucide-react";

export function Reminders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BellRing className="w-6 h-6 text-primary" />
          Recordatorios Diarios
        </CardTitle>
        <CardDescription>Mantente constante con suaves empujones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-md transition-colors hover:bg-accent">
          <Label htmlFor="meditation-reminder" className="font-medium text-sm flex-1">Meditar Diariamente</Label>
          <Switch id="meditation-reminder" />
        </div>
        <div className="flex items-center justify-between p-3 rounded-md transition-colors hover:bg-accent">
          <Label htmlFor="habits-reminder" className="font-medium text-sm flex-1">Seguimiento de Hábitos</Label>
          <Switch id="habits-reminder" />
        </div>
      </CardContent>
    </Card>
  )
}
