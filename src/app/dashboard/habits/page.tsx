
"use client";

import * as React from "react";
import { Habit, HabitTracker } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/language-provider";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Droplets, Footprints, Brain, BookOpen, CheckCircle2, ListChecks } from "lucide-react";

type HabitsByDate = {
  [date: string]: Habit[];
};

const translations = {
  es: {
    title: "Seguimiento de Hábitos",
    description: "Construye una mejor versión de ti, un día a la vez.",
    calendarTitle: "Tu Historial de Hábitos",
    calendarDescription: "Selecciona un día para ver o agregar hábitos.",
    selectedDay: "Hábitos para el",
    noHabitsTitle: "Sin Actividad",
    noHabitsDescription: "No hay hábitos registrados para este día. ¡Empieza agregando uno!",
    initialHabits: {
      hydrate: "Hidratarse (8 vasos)",
      walk: "Caminata Matutina",
      mindful: "Momento de Atención Plena",
      read: "Leer 10 páginas",
    }
  },
  en: {
    title: "Habit Tracking",
    description: "Build a better you, one day at a time.",
    calendarTitle: "Your Habit History",
    calendarDescription: "Select a day to view or add habits.",
    selectedDay: "Habits for",
    noHabitsTitle: "No Activity",
    noHabitsDescription: "No habits logged for this day. Get started by adding one!",
    initialHabits: {
      hydrate: "Hydrate (8 glasses)",
      walk: "Morning Walk",
      mindful: "Mindful Moment",
      read: "Read 10 pages",
    }
  }
};

const initialHabitsData: Habit[] = [
    { id: "hydrate", label: "Hidratarse (8 vasos)", icon: <Droplets className="h-5 w-5 text-primary" />, completed: false },
    { id: "walk", label: "Caminata Matutina", icon: <Footprints className="h-5 w-5 text-primary" />, completed: false },
    { id: "mindful", label: "Momento de Atención Plena", icon: <Brain className="h-5 w-5 text-primary" />, completed: false },
    { id: "read", label: "Leer 10 páginas", icon: <BookOpen className="h-5 w-5 text-primary" />, completed: false },
];

export default function HabitsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [habitsByDate, setHabitsByDate] = React.useState<HabitsByDate>({});

  const dateKey = date ? format(date, 'yyyy-MM-dd') : '';
  const completedDays = Object.keys(habitsByDate).filter(key => habitsByDate[key].length > 0).map(key => new Date(key));

  const getInitialHabitsForDay = (): Habit[] => {
    const defaultHabits = [
      { id: "hydrate", label: t.initialHabits.hydrate, icon: <Droplets className="h-5 w-5 text-primary" />, completed: false },
      { id: "walk", label: t.initialHabits.walk, icon: <Footprints className="h-5 w-5 text-primary" />, completed: false },
      { id: "mindful", label: t.initialHabits.mindful, icon: <Brain className="h-5 w-5 text-primary" />, completed: false },
      { id: "read", label: t.initialHabits.read, icon: <BookOpen className="h-5 w-5 text-primary" />, completed: false },
    ];
    // Deep copy habits to avoid sharing state between days
    return defaultHabits.map(habit => ({ ...habit }));
  }

  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const key = format(selectedDate, 'yyyy-MM-dd');
      if (!habitsByDate[key]) {
        // We will initialize the day with default habits only when user wants to see them
        // or add a new one. For now, let's decide to initialize it on selection
        // to show a pre-populated list.
        setHabitsByDate(prev => ({
          ...prev,
          [key]: getInitialHabitsForDay()
        }));
      }
    }
  };
  
  const handleAddHabit = (newHabitName: string) => {
    if (!dateKey || newHabitName.trim() === "") return;

    const newHabitObject: Habit = {
      id: `custom-${Date.now()}`,
      label: newHabitName,
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      completed: true,
    };

    setHabitsByDate(prev => {
      const currentHabits = prev[dateKey] || [];
      const updatedHabits = [...currentHabits, newHabitObject];
      return { ...prev, [dateKey]: updatedHabits };
    });
  };

  const handleToggleHabit = (id: string) => {
    if (!dateKey) return;

    setHabitsByDate(prev => {
      const dayHabits = prev[dateKey] || [];
      const updatedHabits = dayHabits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      );
      return { ...prev, [dateKey]: updatedHabits };
    });
  };
  
  const formatDate = (date: Date) => {
    if (language === 'es') {
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    }
    return format(date, "MMMM d, yyyy");
  };

  const currentHabits = habitsByDate[dateKey] || [];
  
  React.useEffect(() => {
    if (date) {
      const key = format(date, 'yyyy-MM-dd');
      if (!habitsByDate[key]) {
        setHabitsByDate(prev => ({
          ...prev,
          [key]: getInitialHabitsForDay()
        }));
      }
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{t.calendarTitle}</CardTitle>
                    <CardDescription>{t.calendarDescription}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelectDate}
                        className="rounded-md border p-0"
                        modifiers={{ completed: completedDays }}
                        modifiersStyles={{
                           completed: { 
                             border: "2px solid hsl(var(--primary))",
                             borderRadius: 'var(--radius)',
                           }
                        }}
                     />
                </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            {currentHabits.length > 0 ? (
              <HabitTracker 
                title={`${t.selectedDay} ${date ? formatDate(date) : ''}`} 
                habits={currentHabits}
                onAddHabit={handleAddHabit}
                onToggleHabit={handleToggleHabit}
              />
            ) : (
               <Card className="h-full flex flex-col items-center justify-center">
                <CardHeader className="text-center">
                    <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
                    <CardTitle>{t.noHabitsTitle}</CardTitle>
                    <CardDescription>{t.noHabitsDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                   <HabitTracker 
                    title={`${t.selectedDay} ${date ? formatDate(date) : ''}`} 
                    habits={[]}
                    onAddHabit={handleAddHabit}
                    onToggleHabit={handleToggleHabit}
                    showEmptyState={true}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
