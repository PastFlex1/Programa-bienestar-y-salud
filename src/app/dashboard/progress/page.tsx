import { ProgressCharts } from "@/components/progress-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProgressPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tu Progreso</CardTitle>
            <CardDescription>Visualiza tu viaje y celebra tus logros.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Tus estadísticas de meditación y rachas de hábitos se muestran aquí.</p>
          </CardContent>
        </Card>
        <ProgressCharts />
      </div>
    </div>
  );
}
