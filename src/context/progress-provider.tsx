
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
  
  const debouncedUpdates = React.useRef<{[key: string]: NodeJS.Timeout}>({});

  const syncToFirebase = (dateKey: string, data: DayProgress) => {
    if (session?.uid) {
      // Debounce the update to prevent too many writes in a short time
      if (debouncedUpdates.current[dateKey]) {
        clearTimeout(debouncedUpdates.current[dateKey]);
      }
      debouncedUpdates.current[dateKey] = setTimeout(() => {
        updateProgressData(dateKey, data);
      }, 1000); // Wait 1 second after the last change before saving
    }
  }

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
      const updatedData = { ...dayData, minutes: newMinutes };
      syncToFirebase(dateKey, updatedData);
      return {
        ...prev,
        [dateKey]: updatedData,
      };
    });
  }, [session]);

  const logHabit = React.useCallback((date: Date, completed: boolean) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setProgressData(prev => {
      const dayData = prev[dateKey] || { minutes: 0, habits: 0 };
      const newHabitCount = completed ? dayData.habits + 1 : Math.max(0, dayData.habits - 1);
      const updatedData = { ...dayData, habits: newHabitCount };
      syncToFirebase(dateKey, updatedData);
      return {
        ...prev,
        [dateKey]: updatedData,
      };
    });
  }, [session]);


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
