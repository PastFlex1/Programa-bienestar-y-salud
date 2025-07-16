import { AppHeader } from "@/components/app-header";
import { HabitTracker } from "@/components/habit-tracker";
import { MeditationCard } from "@/components/meditation-card";
import { ProgressCharts } from "@/components/progress-charts";
import { RecommendationForm } from "@/components/recommendation-form";
import { Reminders } from "@/components/reminders";

export default function Home() {
  return (
    <div className="bg-background min-h-screen text-foreground font-body">
      <AppHeader />
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
              <h2 className="text-2xl font-headline font-bold mb-4">Featured Sessions</h2>
              <div className="space-y-4">
                <MeditationCard
                  title="Morning Awakening"
                  description="Start your day with clarity and focus. A gentle session to awaken the senses."
                  lengthMinutes={10}
                  type="Mindfulness"
                  imageUrl="https://placehold.co/600x400.png"
                  imageHint="sunrise yoga"
                />
                <MeditationCard
                  title="Deep Sleep"
                  description="A calming journey to release the day's tension and welcome restful sleep."
                  lengthMinutes={20}
                  type="Sleep"
                  imageUrl="https://placehold.co/600x400.png"
                  imageHint="calm night"
                />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
