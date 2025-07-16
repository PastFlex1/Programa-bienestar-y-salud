"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserData = {
  userName: string;
  avatarUrl: string;
};

type UserProviderState = UserData & {
  updateUser: (data: Partial<UserData>) => void;
};

const UserContext = createContext<UserProviderState | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    userName: "Usuario de Zenith",
    avatarUrl: "https://placehold.co/100x100.png"
  });

  const updateUser = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  return (
    <UserContext.Provider value={{ ...userData, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
