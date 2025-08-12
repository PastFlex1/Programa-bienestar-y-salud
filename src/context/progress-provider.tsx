
"use client";

import * as React from "react";
import { format } from "date-fns";
import { updateProgressData } from "@/lib/firebase/progress";

export type ProgressData = {
  [dateKey: string]: {
    minutes: number;
    habits: number;
  };
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

  const setInitialProgress = (data: ProgressData) => {
    setProgressData(data);
  }

  const setInitialHabits = (dateKey: string, count: number) => {
     setProgressData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        habits: count,
      }
     }))
  }

  const logMeditation = (date: Date, minutes: number) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setProgressData(prev => {
      const dayData = prev[dateKey] || { minutes: 0, habits: 0 };
      const newMinutes = dayData.minutes + minutes;
      const updatedDayData = { ...dayData, minutes: newMinutes };
      
      // Update firebase in the background
      updateProgressData(dateKey, updatedDayData).catch(console.error);

      return {
        ...prev,
        [dateKey]: updatedDayData,
      };
    });
  };

  const logHabit = (date: Date, completed: boolean) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setProgressData(prev => {
      const dayData = prev[dateKey] || { minutes: 0, habits: 0 };
      const newHabitCount = completed ? dayData.habits + 1 : Math.max(0, dayData.habits - 1);
      const updatedDayData = { ...dayData, habits: newHabitCount };

      // Update firebase in the background
      updateProgressData(dateKey, updatedDayData).catch(console.error);

      return {
        ...prev,
        [dateKey]: updatedDayData,
      };
    });
  };

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
