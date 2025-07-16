"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useLanguage } from './language-provider';

type UserData = {
  userName: string;
  avatarUrl: string;
};

type UserProviderState = UserData & {
  updateUser: (data: Partial<UserData>) => void;
};

const UserContext = createContext<UserProviderState | undefined>(undefined);

const userNames = {
  es: "Usuario de Zenith",
  en: "Zenith User"
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();

  const [userData, setUserData] = useState<UserData>({
    userName: userNames[language],
    avatarUrl: "https://placehold.co/100x100.png"
  });

  const updateUser = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const value = useMemo(() => ({
    userName: userData.userName,
    avatarUrl: userData.avatarUrl,
    updateUser
  }), [userData.userName, userData.avatarUrl]);

  return (
    <UserContext.Provider value={value}>
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
