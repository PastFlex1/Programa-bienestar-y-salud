
"use client";

import { type SessionPayload, updateSessionCookie } from "@/lib/firebase/auth";
import * as React from "react";

type SessionProviderProps = {
  children: React.ReactNode;
  value: SessionPayload | null;
};

type SessionProviderState = {
  session: SessionPayload | null;
  loading: boolean;
  updateSession: (data: Partial<SessionPayload>) => Promise<void>;
};

const initialState: SessionProviderState = {
  session: null,
  loading: true,
  updateSession: async () => {},
};

const SessionProviderContext = React.createContext<SessionProviderState>(initialState);

export function SessionProvider({
  children,
  value,
  ...props
}: SessionProviderProps) {
  const [session, setSession] = React.useState<SessionPayload | null>(value);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setSession(value);
    setLoading(false);
  }, [value]);

  const updateSession = async (data: Partial<SessionPayload>) => {
    setSession(prev => prev ? { ...prev, ...data } : null);
    // Update the server-side cookie
    await updateSessionCookie(data);
  }

  const contextValue = {
    session,
    loading,
    updateSession
  };

  return (
    <SessionProviderContext.Provider {...props} value={contextValue}>
      {children}
    </SessionProviderContext.Provider>
  );
}

export const useSession = () => {
  const context = React.useContext(SessionProviderContext);

  if (context === undefined)
    throw new Error("useSession must be used within a SessionProvider");

  return context;
};
