
"use client";

import * as React from "react";
import { HabitTracker } from "@/components/habit-tracker";
import type { Habit as HabitUI } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/language-provider";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Droplets, Footprints, Brain, BookOpen, CheckCircle2 } from "lucide-react";
import { getHabitsForDate, updateHabitsForDate } from "@/lib/firebase/habits";
import type { Habit as HabitDB } from "@/lib/firebase/habits";
import { useAuth } from "@/context/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const translations = {
  es: {
    title: "Seguimiento de Hábitos",
    description: "Construye una mejor versión de ti, un día a la vez.",
    calendarTitle: "Tu Historial de Hábitos",
    calendarDescription: "Selecciona un día para ver o agregar hábitos.",
    selectedDay: "Hábitos para el",
    loading: "Cargando hábitos...",
    initialHabits: {
      hydrate: "Hidratarse (8 vasos)",
      walk: "Caminata Matutina",
      mindful: "Momento de Atención Plena",
      read: "Leer 10 páginas",
    },
    toastSuccessTitle: "Éxito",
    toastSuccessDescription: "Tus hábitos se han guardado correctamente.",
    toastErrorTitle: "Error",
    toastErrorDescription: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
    toastHabitAdded: "Hábito agregado exitosamente.",
  },
  en: {
    title: "Habit Tracking",
    description: "Build a better you, one day at a time.",
    calendarTitle: "Your Habit History",
    calendarDescription: "Select a day to view or add habits.",
    selectedDay: "Habits for",
    loading: "Loading habits...",
    initialHabits: {
      hydrate: "Hydrate (8 glasses)",
      walk: "Morning Walk",
      mindful: "Mindful Moment",
      read: "Read 10 pages",
    },
    toastSuccessTitle: "Success",
    toastSuccessDescription: "Your habits have been saved successfully.",
    toastErrorTitle: "Error",
    toastErrorDescription: "Could not save changes. Please try again.",
    toastHabitAdded: "Habit added successfully.",
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

const mapHabitsForUI = (dbHabits: HabitDB[]): HabitUI[] => {
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

export default function HabitsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [habits, setHabits] = React.useState<HabitDB[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const dateKey = date ? format(date, 'yyyy-MM-dd') : '';

  React.useEffect(() => {
    // Do not fetch if there is no user or no selected date.
    if (!user || !dateKey) {
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const fetchHabits = async () => {
      setIsLoading(true);
      try {
        const fetchedHabits = await getHabitsForDate(dateKey, user.uid);
        if (isMounted) {
            if (fetchedHabits.length === 0) {
                const initialHabits = getInitialHabitsForDay(t);
                // Pre-fill habits for the day if none exist
                await updateHabitsForDate(initialHabits, dateKey, user.uid);
                setHabits(initialHabits);
            } else {
                setHabits(fetchedHabits);
            }
        }
      } catch (error) {
        console.error("Error fetching habits:", error);
        toast({
            variant: "destructive",
            title: t.toastErrorTitle,
            description: "Could not fetch habits.",
        });
        if (isMounted) setHabits(getInitialHabitsForDay(t));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHabits();

    return () => {
      isMounted = false;
    };

  }, [dateKey, user, t, toast]);
  
  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const updateHabits = async (updatedHabits: HabitDB[]) => {
      if (!dateKey || !user) return;
      
      try {
          await updateHabitsForDate(updatedHabits, dateKey, user.uid);
          return true; // Indicate success
      } catch (e) {
          console.error("Failed to update habits:", e);
          toast({
              variant: "destructive",
              title: t.toastErrorTitle,
              description: t.toastErrorDescription,
          });
          return false; // Indicate failure
      }
  };

  const handleAddHabit = async (newHabitName: string) => {
    if (newHabitName.trim() === "" || !user || !dateKey) return;

    const newHabit: HabitDB = {
      id: `custom-${Date.now()}`,
      label: newHabitName,
      completed: false,
    };
    
    const newHabitsList = [...habits, newHabit];
    
    // Set state locally for instant UI update
    setHabits(newHabitsList);
    
    // Then, persist the changes to Firestore
    const success = await updateHabits(newHabitsList);

    if (success) {
      toast({
          title: t.toastSuccessTitle,
          description: t.toastHabitAdded,
      });
    } else {
      // If the update fails, revert the local state to the previous one
      setHabits(habits);
    }
  };
  
  const handleToggleHabit = (id: string) => {
    const newHabitsList = habits.map(habit =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(newHabitsList); // Optimistic UI update
    updateHabits(newHabitsList).then(success => {
      if(!success) {
        // Revert on failure
        setHabits(habits);
      }
    });
  };
  
  const formatDate = (date: Date) => {
    if (language === 'es') {
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    }
    return format(date, "MMMM d, yyyy");
  };

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

