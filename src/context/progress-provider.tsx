
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
  
  const isInitialDataLoaded = React.useRef(false);

  React.useEffect(() => {
    if (!isInitialDataLoaded.current || !session) {
      return;
    }
    
    const syncToFirebase = async () => {
        // Create a stable copy of the data to sync
        const dataToSync = { ...progressData };
        for (const dateKey in dataToSync) {
            await updateProgressData(dateKey, dataToSync[dateKey]);
        }
    };
    
    // Using a timeout to debounce the firebase update.
    const timer = setTimeout(() => {
        syncToFirebase().catch(console.error);
    }, 1000); // Wait 1 second after the last change to save

    return () => clearTimeout(timer);

  }, [progressData, session]);


  const setInitialProgress = React.useCallback((data: ProgressData) => {
    setProgressData(data);
    // Mark as loaded only after the first full data fetch
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
