
"use client";

import * as React from "react";
import { HabitTracker } from "@/components/habit-tracker";
import type { Habit as HabitUI } from "@/components/habit-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/language-provider";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Droplets, Footprints, Brain, BookOpen, CheckCircle2, Plus } from "lucide-react";
import { getHabitsForDate, updateHabitsForDate } from "@/lib/firebase/habits";
import type { Habit as HabitDB } from "@/lib/firebase/habits";
import { useAuth } from "@/context/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    addHabit: "Agregar Hábito",
    addNewHabit: "Agregar Nuevo Hábito",
    habitName: "Nombre",
    habitNamePlaceholder: "Ej: Meditar por 5 minutos",
    cancel: "Cancelar",
    add: "Agregar",
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
    addHabit: "Add Habit",
    addNewHabit: "Add New Habit",
    habitName: "Name",
    habitNamePlaceholder: "E.g.: Meditate for 5 minutes",
    cancel: "Cancel",
    add: "Add",
  }
};


const getInitialHabitsForDay = (t: any): HabitDB[] => [
    { id: "hydrate", label: t.initialHabits.hydrate, completed: false },
    { id: "walk", label: t.initialHabits.walk, completed: false },
    { id: "mindful", label: t.initialHabits.mindful, completed: false },
    { id: "read", label: t.initialHabits.read, completed: false },
];

const mapHabitsForUI = (dbHabits: HabitDB[]): HabitUI[] => {
    const iconMapping: { [key: string]: React.ReactNode } = {
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
    const [newHabitName, setNewHabitName] = React.useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

    const dateKey = date ? format(date, 'yyyy-MM-dd') : '';

    React.useEffect(() => {
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

        return () => { isMounted = false; };
    }, [dateKey, user, t]);

    const handleAddHabit = async () => {
        if (newHabitName.trim() === "" || !user || !dateKey) return;

        const newHabit: HabitDB = {
            id: `custom-${Date.now()}`,
            label: newHabitName,
            completed: false,
        };

        const newHabitsList = [...habits, newHabit];
        setHabits(newHabitsList); // Optimistic update
        setNewHabitName("");
        setIsAddDialogOpen(false);

        try {
            await updateHabitsForDate(newHabitsList, dateKey, user.uid);
            toast({
                title: t.toastSuccessTitle,
                description: t.toastHabitAdded,
            });
        } catch (e) {
            console.error("Failed to update habits:", e);
            setHabits(habits); // Revert on failure
            toast({
                variant: "destructive",
                title: t.toastErrorTitle,
                description: t.toastErrorDescription,
            });
        }
    };

    const handleToggleHabit = async (id: string) => {
        if (!user || !dateKey) return;
        
        const toggledHabits = habits.map(habit =>
            habit.id === id ? { ...habit, completed: !habit.completed } : habit
        );
        
        setHabits(toggledHabits); // Optimistic update
        
        try {
            await updateHabitsForDate(toggledHabits, dateKey, user.uid);
        } catch(e) {
            setHabits(habits); // Revert
             toast({
                variant: "destructive",
                title: t.toastErrorTitle,
                description: t.toastErrorDescription,
            });
        }
    };

    const formatDate = (d: Date) => language === 'es'
        ? format(d, "d 'de' MMMM 'de' yyyy", { locale: es })
        : format(d, "MMMM d, yyyy");

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
                                    onSelect={setDate}
                                    className="rounded-md border p-0"
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                        {isLoading ? (
                            <HabitTrackerSkeleton />
                        ) : (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="font-headline">{`${t.selectedDay} ${date ? formatDate(date) : ''}`}</CardTitle>
                                    </div>
                                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="outline">
                                                <Plus className="h-4 w-4" />
                                                <span className="sr-only">{t.addHabit}</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{t.addNewHabit}</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="habit-name" className="text-right">
                                                        {t.habitName}
                                                    </Label>
                                                    <Input
                                                        id="habit-name"
                                                        value={newHabitName}
                                                        onChange={(e) => setNewHabitName(e.target.value)}
                                                        className="col-span-3"
                                                        placeholder={t.habitNamePlaceholder}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button type="button" variant="secondary">{t.cancel}</Button>
                                                </DialogClose>
                                                <Button onClick={handleAddHabit} disabled={!newHabitName.trim()}>{t.add}</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent>
                                    <HabitTracker
                                        habits={mapHabitsForUI(habits)}
                                        onToggleHabit={handleToggleHabit}
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

