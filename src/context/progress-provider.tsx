
"use client";

import * as React from "react";
import { format } from "date-fns";
import { updateProgressData } from "@/lib/firebase/progress";
import { useSession } from "./session-provider";

export type DayProgress = {
  minutes: number;
  habits: number;
};

export type ProgressData = {
  [dateKey: string]: DayProgress
};

type ProgressProviderProps = {
  children: React.ReactNode;
};

type ProgressProviderState = {
  progressData: ProgressData;
  logMeditation: (date: Date, minutes: number) => void;
  logHabit: (date: Date, completed: boolean) => void;
  setInitialProgress: (data: ProgressData) => void;
  setInitialHabits: (dateKey: string, count: number) => void;
};

const initialState: ProgressProviderState = {
  progressData: {},
  logMeditation: () => null,
  logHabit: () => null,
  setInitialProgress: () => null,
  setInitialHabits: () => null,
};

const ProgressProviderContext = React.createContext<ProgressProviderState>(initialState);

export function ProgressProvider({ children, ...props }: ProgressProviderProps) {
  const [progressData, setProgressData] = React.useState<ProgressData>({});
  const { session } = useSession();

  const handleDataUpdate = React.useCallback(async (dateKey: string, newDayData: DayProgress) => {
    if (session) {
        try {
            await updateProgressData(dateKey, newDayData);
        } catch (error) {
            console.error("Failed to sync progress data:", error);
        }
    }
  }, [session]);

  const setInitialProgress = React.useCallback((data: ProgressData) => {
    setProgressData(data);
  }, []);

  const setInitialHabits = React.useCallback((dateKey: string, count: number) => {
     setProgressData(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || { minutes: 0 }),
        habits: count,
      }
     }));
  }, []);

  const logMeditation = React.useCallback((date: Date, minutes: number) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setProgressData(prev => {
      const dayData = prev[dateKey] || { minutes: 0, habits: 0 };
      const newMinutes = dayData.minutes + minutes;
      const newDayData = { ...dayData, minutes: newMinutes };
      handleDataUpdate(dateKey, newDayData);
      return {
        ...prev,
        [dateKey]: newDayData,
      };
    });
  }, [handleDataUpdate]);

  const logHabit = React.useCallback((date: Date, completed: boolean) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setProgressData(prev => {
      const dayData = prev[dateKey] || { minutes: 0, habits: 0 };
      const newHabitCount = completed ? dayData.habits + 1 : Math.max(0, dayData.habits - 1);
      const newDayData = { ...dayData, habits: newHabitCount };
      handleDataUpdate(dateKey, newDayData);
      return {
        ...prev,
        [dateKey]: newDayData,
      };
    });
  }, [handleDataUpdate]);


  const value = {
    progressData,
    logMeditation,
    logHabit,
    setInitialProgress,
    setInitialHabits,
  };

  return (
    <ProgressProviderContext.Provider {...props} value={value}>
      {children}
    </ProgressProviderContext.Provider>
  );
}

export const useProgress = () => {
  const context = React.useContext(ProgressProviderContext);

  if (context === undefined)
    throw new Error("useProgress must be used within a ProgressProvider");

  return context;
};

    