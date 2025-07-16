import { HabitTracker } from "@/components/habit-tracker";
import { MeditationCard } from "@/components/meditation-card";
import { ProgressCharts } from "@/components/progress-charts";
import { RecommendationForm } from "@/components/recommendation-form";
import { Reminders } from "@/components/reminders";

export default function DashboardPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 space-y-8">
          <RecommendationForm />
          <ProgressCharts />
        </div>

        <div className="space-y-8">
          <HabitTracker />
          <Reminders />
          <div>
            <h2 className="text-2xl font-headline font-bold mb-4">Sesiones Destacadas</h2>
            <div className="space-y-4">
              <MeditationCard
                title="Despertar Matutino"
                description="Comienza tu día con claridad y enfoque. Una sesión suave para despertar los sentidos."
                lengthMinutes={10}
                type="Mindfulness"
                imageUrl="https://placehold.co/600x400.png"
                imageHint="sunrise yoga"
              />
              <MeditationCard
                title="Sueño Profundo"
                description="Un viaje relajante para liberar la tensión del día y dar la bienvenida a un sueño reparador."
                lengthMinutes={20}
                type="Sueño"
                imageUrl="https://placehold.co/600x400.png"
                imageHint="calm night"
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
