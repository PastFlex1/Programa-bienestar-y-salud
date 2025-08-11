
"use client";

import * as React from "react";
import { Habit, HabitTracker } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/language-provider";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Droplets, Footprints, Brain, BookOpen, CheckCircle2, ListChecks } from "lucide-react";
import { getHabitsForDate, updateHabitsForDate } from "@/lib/firebase/habits";
import { useAuth } from "@/context/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Habit as HabitDB } from "@/lib/firebase/habits";

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
    },
    toastSuccess: "Hábito agregado exitosamente",
    toastError: "Error al agregar el hábito"
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
    },
    toastSuccess: "Habit added successfully",
    toastError: "Error adding habit"
  }
};

const getInitialHabitsForDay = (t: any): HabitDB[] => {
    return [
      { id: "hydrate", label: t.initialHabits.hydrate, completed: false },
      { id: "walk", label: t.initialHabits.walk, completed: false },
      { id: "mindful", label: t.initialHabits.mindful, completed: false },
      { id: "read", label: t.initialHabits.read, completed: false },
    ];
};

export default function HabitsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [habits, setHabits] = React.useState<HabitDB[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const dateKey = date ? format(date, 'yyyy-MM-dd') : '';

  React.useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return; 
    }
    if (!user) {
      setIsLoading(false);
      setHabits([]);
      return;
    }
    
    let isMounted = true;
    
    const fetchHabits = async () => {
      if (!dateKey) return;
      setIsLoading(true);
      try {
        let fetchedHabits = await getHabitsForDate(dateKey, user.uid);
        if (isMounted) {
            if (fetchedHabits.length === 0) {
                // If no habits exist for the day, initialize them
                const initialHabits = getInitialHabitsForDay(t);
                await updateHabitsForDate(initialHabits, dateKey, user.uid);
                setHabits(initialHabits);
            } else {
                setHabits(fetchedHabits);
            }
        }
      } catch (error) {
        console.error("Error fetching habits:", error);
        if (isMounted) setHabits(getInitialHabitsForDay(t));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHabits();

    return () => {
      isMounted = false;
    };

  }, [dateKey, user, authLoading, t]);
  
  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const handleAddHabit = async (newHabitName: string) => {
    if (!dateKey || newHabitName.trim() === "" || !user) return;

    const newHabit: HabitDB = {
      id: `custom-${Date.now()}`,
      label: newHabitName,
      completed: false,
    };
    
    // Optimistic update inspired by user example
    const newHabitsList = [...habits, newHabit];
    setHabits(newHabitsList);

    try {
      await updateHabitsForDate(newHabitsList, dateKey, user.uid);
      toast({
          title: t.toastSuccess,
      });
    } catch(e) {
      console.error("Failed to add habit:", e);
      // Revert on failure
      setHabits(habits);
      toast({
          title: t.toastError,
          variant: "destructive"
      });
    }
  };

  const handleToggleHabit = async (id: string) => {
    if (!dateKey || !user) return;
    
    const newHabitsList = habits.map(habit =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    
    // Optimistic update
    setHabits(newHabitsList);
    
    try {
        await updateHabitsForDate(newHabitsList, dateKey, user.uid);
    } catch (e) {
        console.error("Failed to toggle habit:", e);
        // Revert on failure
        setHabits(habits);
    }
  };
  
  const formatDate = (date: Date) => {
    if (language === 'es') {
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    }
    return format(date, "MMMM d, yyyy");
  };
  
  const mapHabitsForUI = (dbHabits: HabitDB[]): Habit[] => {
    const iconMapping: {[key: string]: React.ReactNode} = {
        hydrate: <Droplets className="h-5 w-5 text-primary" />,
        walk: <Footprints className="h-5 w-5 text-primary" />,
        mindful: <Brain className="h-5 w-5 text-primary" />,
        read: <BookOpen className="h-5 w-5 text-primary" />
    };
    return dbHabits.map(h => ({
        ...h,
        icon: iconMapping[h.id] || <CheckCircle2 className="h-5 w-5 text-primary" />
    }));
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

  const pageLoading = authLoading || isLoading;

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
            {pageLoading ? (
              <HabitTrackerSkeleton />
            ) : (
              <HabitTracker 
                title={`${t.selectedDay} ${date ? formatDate(date) : ''}`} 
                habits={mapHabitsForUI(habits)}
                onAddHabit={handleAddHabit}
                onToggleHabit={handleToggleHabit}
                showEmptyState={habits.length === 0}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
