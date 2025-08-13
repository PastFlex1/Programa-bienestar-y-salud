
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
  
  // This effect will run when progressData changes and sync it with Firebase
  // We use a ref to prevent it from running on the initial render.
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    if (isMounted.current && session?.uid) {
        // Find the latest updated day to sync
        const latestDateKey = Object.keys(progressData).sort().pop();
        if (latestDateKey && progressData[latestDateKey]) {
           updateProgressData(latestDateKey, progressData[latestDateKey]);
        }
    } else {
        isMounted.current = true;
    }
  }, [progressData, session]);


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
      return {
        ...prev,
        [dateKey]: { ...dayData, minutes: newMinutes },
      };
    });
  }, []);

  const logHabit = React.useCallback((date: Date, completed: boolean) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setProgressData(prev => {
      const dayData = prev[dateKey] || { minutes: 0, habits: 0 };
      const newHabitCount = completed ? dayData.habits + 1 : Math.max(0, dayData.habits - 1);
      return {
        ...prev,
        [dateKey]: { ...dayData, habits: newHabitCount },
      };
    });
  }, []);


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
