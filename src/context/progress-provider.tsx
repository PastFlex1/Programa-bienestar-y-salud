
"use client";

import * as React from "react";
import { format } from "date-fns";
import { updateProgressData } from "@/lib/firebase/progress";
import { useSession } from "./session-provider";

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
  const { session } = useSession();
  
  // Ref to track if the initial data has been set
  const isInitialDataLoaded = React.useRef(false);

  // useEffect to sync data to Firebase when it changes
  React.useEffect(() => {
    // Don't run on the initial data load, only on subsequent user-triggered changes
    if (!isInitialDataLoaded.current || !session) {
      return;
    }

    // This function will run after the state has been updated and the component re-rendered.
    // We can safely perform side effects here.
    const syncToFirebase = async () => {
        for (const dateKey in progressData) {
            // A more robust solution might track which keys are "dirty"
            // but for this app's scale, updating all loaded keys is fine.
            await updateProgressData(dateKey, progressData[dateKey]);
        }
    };

    // Debounce or throttle this in a real app if updates are frequent
    syncToFirebase().catch(console.error);

  }, [progressData, session]);


  const setInitialProgress = React.useCallback((data: ProgressData) => {
    setProgressData(data);
    isInitialDataLoaded.current = true;
  }, []);

  const setInitialHabits = React.useCallback((dateKey: string, count: number) => {
     setProgressData(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || { minutes: 0 }),
        habits: count,
      }
     }));
     // We don't mark initial data as loaded here, as this is part of the initial setup
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
