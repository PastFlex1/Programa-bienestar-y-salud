import { HabitTracker } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HabitsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seguimiento de Hábitos</CardTitle>
            <CardDescription>Construye una mejor versión de ti, un día a la vez.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Aquí puedes ver y gestionar todos tus hábitos diarios, semanales y mensuales.</p>
          </CardContent>
        </Card>
        <HabitTracker />
      </div>
    </div>
  );
}
