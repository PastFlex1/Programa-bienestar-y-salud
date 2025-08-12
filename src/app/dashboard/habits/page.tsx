
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/context/language-provider";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Droplets, Footprints, Brain, BookOpen, CheckCircle2, Plus, Loader2 } from "lucide-react";
import type { Habit } from "@/lib/firebase/habits";
import { getHabitsForDate, updateHabitsForDate } from "@/lib/firebase/habits";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HabitTracker } from "@/components/habit-tracker";
import { useProgress } from "@/context/progress-provider";

const translations = {
  es: {
    title: "Seguimiento de Hábitos",
    description: "Construye una mejor versión de ti, un día a la vez.",
    calendarTitle: "Tu Historial de Hábitos",
    calendarDescription: "Selecciona un día para ver o agregar hábitos.",
    selectedDay: "Hábitos para el",
    loading: "Cargando hábitos...",
    toastSuccessTitle: "Éxito",
    toastSuccessDescription: "Tus hábitos se han actualizado.",
    toastErrorTitle: "Error",
    toastErrorDescription: "No se pudieron guardar los cambios.",
    toastHabitAdded: "Hábito agregado exitosamente.",
    addHabit: "Agregar Hábito",
    addNewHabit: "Agregar Nuevo Hábito",
    addNewHabitDescription: "Ingresa el nombre del nuevo hábito que quieres registrar.",
    habitName: "Nombre",
    habitNamePlaceholder: "Ej: Meditar por 5 minutos",
    cancel: "Cancelar",
    add: "Agregar",
    adding: "Agregando...",
    habitCompleted: "¡Hábito Completado!",
    habitCompletedDescription: "¡Sigue así!",
    close: "Cerrar",
  },
  en: {
    title: "Habit Tracking",
    description: "Build a better you, one day at a time.",
    calendarTitle: "Your Habit History",
    calendarDescription: "Select a day to view or add habits.",
    selectedDay: "Habits for",
    loading: "Loading habits...",
    toastSuccessTitle: "Success",
    toastSuccessDescription: "Your habits have been updated.",
    toastErrorTitle: "Error",
    toastErrorDescription: "Could not save changes.",
    toastHabitAdded: "Habit added successfully.",
    addHabit: "Add Habit",
    addNewHabit: "Add New Habit",
    addNewHabitDescription: "Enter the name of the new habit you want to track.",
    habitName: "Name",
    habitNamePlaceholder: "E.g.: Meditate for 5 minutes",
    cancel: "Cancel",
    add: "Add",
    adding: "Adding...",
    habitCompleted: "Habit Completed!",
    habitCompletedDescription: "Keep up the great work!",
    close: "Close",
  }
};

const mapHabitsForUI = (dbHabits: Habit[]) => {
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

export default function HabitsPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const { toast } = useToast();
    const { logHabit, setInitialHabits } = useProgress();

    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [habits, setHabits] = React.useState<Habit[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [newHabitName, setNewHabitName] = React.useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = React.useState(false);

    const dateKey = date ? format(date, 'yyyy-MM-dd') : '';

    React.useEffect(() => {
        if (!dateKey) return;
        setIsLoading(true);
        getHabitsForDate(dateKey)
            .then(fetchedHabits => {
                setHabits(fetchedHabits);
                setInitialHabits(dateKey, fetchedHabits.filter(h => h.completed).length);
            })
            .catch(err => {
                console.error(err);
                toast({ variant: "destructive", title: t.toastErrorTitle, description: t.toastErrorDescription });
            })
            .finally(() => setIsLoading(false));
    }, [dateKey, toast, t, setInitialHabits]);


    const handleAddHabit = async () => {
        setIsSaving(true);
        if (newHabitName.trim() === "" || !dateKey) {
             toast({ variant: "destructive", title: "Error", description: "El nombre del hábito no puede estar vacío." });
             setIsSaving(false);
            return;
        }

        const newHabit: Habit = {
            id: `custom-${Date.now()}`,
            label: newHabitName,
            completed: false,
        };

        const newHabitsList = [...habits, newHabit];
        
        try {
            await updateHabitsForDate(newHabitsList, dateKey);
            setHabits(newHabitsList);
            toast({ title: t.toastSuccessTitle, description: t.toastHabitAdded });
            setNewHabitName(""); 
            setIsAddDialogOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: t.toastErrorTitle, description: t.toastErrorDescription });
        } finally {
            setIsSaving(false);
        }
    };


    const handleToggleHabit = async (id: string) => {
        if (!date) return;
        let habitJustCompleted = false;
        
        const toggledHabits = habits.map(habit => {
            if (habit.id === id) {
                const updatedHabit = { ...habit, completed: !habit.completed };
                 if (updatedHabit.completed) {
                    habitJustCompleted = true;
                    logHabit(date, true);
                } else {
                    logHabit(date, false);
                }
                return updatedHabit;
            }
            return habit;
        });
        
        try {
            await updateHabitsForDate(toggledHabits, dateKey);
            setHabits(toggledHabits);
            if (habitJustCompleted) {
                setIsCompletionModalOpen(true);
            }
        } catch (error) {
            toast({ variant: "destructive", title: t.toastErrorTitle, description: t.toastErrorDescription });
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
                                    disabled={isSaving || isLoading}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="font-headline">{`${t.selectedDay} ${date ? formatDate(date) : ''}`}</CardTitle>
                                </div>
                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="outline" disabled={isLoading}>
                                            <Plus className="h-4 w-4" />
                                            <span className="sr-only">{t.addHabit}</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t.addNewHabit}</DialogTitle>
                                            <DialogDescription>{t.addNewHabitDescription}</DialogDescription>
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
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !isSaving && newHabitName.trim()) {
                                                            e.preventDefault();
                                                            handleAddHabit();
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" variant="secondary" disabled={isSaving}>{t.cancel}</Button>
                                            </DialogClose>
                                            <Button onClick={handleAddHabit} disabled={!newHabitName.trim() || isSaving}>
                                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isSaving ? t.adding : t.add}
                                            </Button>
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
                    </div>
                </div>
            </div>
             <Dialog open={isCompletionModalOpen} onOpenChange={setIsCompletionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex justify-center items-center h-16 w-16 rounded-full bg-primary/20 mx-auto mb-4">
                           <CheckCircle2 className="h-10 w-10 text-primary" />
                        </div>
                        <DialogTitle className="text-center font-headline text-2xl">{t.habitCompleted}</DialogTitle>
                        <DialogDescription className="text-center">{t.habitCompletedDescription}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="w-full">{t.close}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
