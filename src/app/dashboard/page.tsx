
import { MeditationCard } from "@/components/meditation-card";
import { RecommendationForm } from "@/components/recommendation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <RecommendationForm />
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Explorar Sesiones</CardTitle>
            <CardDescription>Encuentra la meditación perfecta para cada momento de tu día.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o tema..." className="pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Todo</Badge>
                <Badge variant="outline">Estrés</Badge>
                <Badge variant="outline">Sueño</Badge>
                <Badge variant="outline">Enfoque</Badge>
                <Badge variant="outline">Ansiedad</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl font-headline font-bold">Para Empezar</h2>
        <MeditationCard
          title="Despertar Matutino"
          description="Comienza tu día con claridad y enfoque. Una sesión suave para despertar los sentidos."
          lengthMinutes={10}
          type="Mindfulness"
          imageUrl="https://placehold.co/600x400.png"
          imageHint="sunrise yoga"
        />
        <h2 className="text-2xl font-headline font-bold mt-8">Relajación Profunda</h2>
        <MeditationCard
          title="Sueño Profundo"
          description="Un viaje relajante para liberar la tensión del día y dar la bienvenida a un sueño reparador."
          lengthMinutes={20}
          type="Sueño"
          imageUrl="https://placehold.co/600x400.png"
          imageHint="calm night"
        />
        <MeditationCard
          title="Alivio del Estrés"
          description="Encuentra tu calma interior y reduce el estrés con esta sesión guiada de respiración."
          lengthMinutes={15}
          type="Estrés"
          imageUrl="https://placehold.co/600x400.png"
          imageHint="serene forest"
        />
        <h2 className="text-2xl font-headline font-bold mt-8">Concentración</h2>
        <MeditationCard
          title="Foco Intenso"
          description="Mejora tu concentración y productividad con esta meditación para la claridad mental."
          lengthMinutes={12}
          type="Enfoque"
          imageUrl="https://placehold.co/600x400.png"
          imageHint="focused work"
        />
      </div>
    </div>
  );
}
