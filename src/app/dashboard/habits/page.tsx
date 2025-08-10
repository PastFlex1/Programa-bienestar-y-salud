
"use client";

import * as React from "react";
import { Habit, HabitTracker } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/language-provider";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Droplets, Footprints, Brain, BookOpen, CheckCircle2, ListChecks } from "lucide-react";
import { getHabitsForDate, toggleHabit, addHabit, initializeHabitsForDay } from "@/lib/firebase/habits";
import { useAuth } from "@/context/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

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
    loading: "Cargando hábitos...",
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
    loading: "Loading habits...",
    initialHabits: {
      hydrate: "Hydrate (8 glasses)",
      walk: "Morning Walk",
      mindful: "Mindful Moment",
      read: "Read 10 pages",
    }
  }
};

const getInitialHabitsForDay = (t: any): Habit[] => {
    return [
      { id: "hydrate", label: t.initialHabits.hydrate, icon: <Droplets className="h-5 w-5 text-primary" />, completed: false },
      { id: "walk", label: t.initialHabits.walk, icon: <Footprints className="h-5 w-5 text-primary" />, completed: false },
      { id: "mindful", label: t.initialHabits.mindful, icon: <Brain className="h-5 w-5 text-primary" />, completed: false },
      { id: "read", label: t.initialHabits.read, icon: <BookOpen className="h-5 w-5 text-primary" />, completed: false },
    ].map(habit => ({ ...habit })); // Deep copy
};

export default function HabitsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user } = useAuth();
  
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const dateKey = date ? format(date, 'yyyy-MM-dd') : '';

  React.useEffect(() => {
    if (!dateKey || !user) return;
    
    setIsLoading(true);

    const fetchAndInitializeHabits = async () => {
        const initialHabits = getInitialHabitsForDay(t);
        await initializeHabitsForDay(initialHabits, dateKey);
        
        const fetchedHabits = await getHabitsForDate(dateKey);
        setHabits(fetchedHabits.length > 0 ? fetchedHabits : initialHabits);
        setIsLoading(false);
    };

    fetchAndInitializeHabits();

  }, [dateKey, user, t]);
  
  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const handleAddHabit = async (newHabitName: string) => {
    if (!dateKey || newHabitName.trim() === "") return;

    const newHabitObject: Habit = {
      id: `custom-${Date.now()}`,
      label: newHabitName,
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      completed: false, // Start as not completed
    };
    
    await addHabit(newHabitObject, dateKey);
    setHabits(prev => [...prev, newHabitObject]);
  };

  const handleToggleHabit = async (id: string) => {
    if (!dateKey) return;
    
    const habitToToggle = habits.find(h => h.id === id);
    if (!habitToToggle) return;

    const newCompletedStatus = !habitToToggle.completed;
    
    setHabits(prev => 
      prev.map(habit =>
        habit.id === id ? { ...habit, completed: newCompletedStatus } : habit
      )
    );
    
    await toggleHabit(id, newCompletedStatus, dateKey);
  };
  
  const formatDate = (date: Date) => {
    if (language === 'es') {
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    }
    return format(date, "MMMM d, yyyy");
  };

  const HabitTrackerSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <Skeleton className="h-5 w-5 rounded-sm" />
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );

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
                     />
                </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            {isLoading ? (
              <HabitTrackerSkeleton />
            ) : habits.length > 0 ? (
              <HabitTracker 
                title={`${t.selectedDay} ${date ? formatDate(date) : ''}`} 
                habits={habits}
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
