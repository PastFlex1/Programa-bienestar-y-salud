
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
import { useToast } from "@/hooks/use-toast";

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
    },
    toastSuccess: "Hábito agregado exitosamente",
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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [habits, setHabits] = React.useState<Habit[]>([]);
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
    
    const fetchAndInitializeHabits = async () => {
      if (!dateKey) {
        return;
      }
      
      setIsLoading(true);
      
      try {
        const initialHabits = getInitialHabitsForDay(t);
        await initializeHabitsForDay(initialHabits, dateKey, user.uid);
        
        const fetchedHabits = await getHabitsForDate(dateKey, user.uid);
        if (isMounted) {
          setHabits(fetchedHabits.length > 0 ? fetchedHabits : initialHabits);
        }
      } catch (error) {
        console.error("Error fetching habits:", error);
        if (isMounted) {
          setHabits(getInitialHabitsForDay(t));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAndInitializeHabits();

    return () => {
      isMounted = false;
    };

  }, [dateKey, user, authLoading, t]);
  
  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const handleAddHabit = async (newHabitName: string) => {
    if (!dateKey || newHabitName.trim() === "" || !user) return;

    const newHabitObject: Habit = {
      id: `custom-${Date.now()}`,
      label: newHabitName,
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      completed: false,
    };
    
    // Optimistically update UI
    setHabits(prev => [...prev, newHabitObject]);
    
    try {
      await addHabit(newHabitObject, dateKey, user.uid);
      toast({
          title: t.toastSuccess,
      });
    } catch(e) {
      console.error("Failed to add habit:", e);
      // Revert optimistic update on failure
      setHabits(prev => prev.filter(h => h.id !== newHabitObject.id));
      // Optional: Add error toast
    }
  };

  const handleToggleHabit = async (id: string) => {
    if (!dateKey || !user) return;
    
    const originalHabits = [...habits];
    const habitToToggle = originalHabits.find(h => h.id === id);
    if (!habitToToggle) return;

    const newCompletedStatus = !habitToToggle.completed;
    
    // Optimistic update
    setHabits(prev => 
      prev.map(habit =>
        habit.id === id ? { ...habit, completed: newCompletedStatus } : habit
      )
    );
    
    try {
        await toggleHabit(id, newCompletedStatus, dateKey, user.uid);
    } catch (e) {
        console.error("Failed to toggle habit:", e);
        // Revert on failure
        setHabits(originalHabits);
    }
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
                habits={habits}
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
