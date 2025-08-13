
"use client";

import * as React from "react";
import { format } from "date-fns";
import { updateProgressData } from "@/lib/local-data/progress";

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
  
  const debouncedUpdates = React.useRef<{[key: string]: NodeJS.Timeout}>({});

  const syncToLocalStorage = React.useCallback((dateKey: string, data: DayProgress) => {
      if (debouncedUpdates.current[dateKey]) {
        clearTimeout(debouncedUpdates.current[dateKey]);
      }
      debouncedUpdates.current[dateKey] = setTimeout(() => {
        updateProgressData(dateKey, data);
      }, 1000); 
  }, []);

  const setInitialProgress = React.useCallback((data: ProgressData) => {
    setProgressData(data);
  }, []);

  const setInitialHabits = React.useCallback((dateKey: string, count: number) => {
     setProgressData(prev => {
        const currentDayData = prev[dateKey] || { minutes: 0, habits: 0 };
        if (currentDayData.habits !== count) {
            return {
                ...prev,
                [dateKey]: {
                    ...currentDayData,
                    habits: count,
                }
            };
        }
        return prev;
     });
  }, []);

  const logMeditation = React.useCallback((date: Date, minutes: number) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setProgressData(prev => {
      const dayData = prev[dateKey] || { minutes: 0, habits: 0 };
      const newMinutes = dayData.minutes + minutes;
      const updatedData = { ...dayData, minutes: newMinutes };
      syncToLocalStorage(dateKey, updatedData);
      return {
        ...prev,
        [dateKey]: updatedData,
      };
    });
  }, [syncToLocalStorage]);

  const logHabit = React.useCallback((date: Date, completed: boolean) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setProgressData(prev => {
      const dayData = prev[dateKey] || { minutes: 0, habits: 0 };
      const newHabitCount = completed ? dayData.habits + 1 : Math.max(0, dayData.habits - 1);
      const updatedData = { ...dayData, habits: newHabitCount };
      syncToLocalStorage(dateKey, updatedData);
      return {
        ...prev,
        [dateKey]: updatedData,
      };
    });
  }, [syncToLocalStorage]);


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
