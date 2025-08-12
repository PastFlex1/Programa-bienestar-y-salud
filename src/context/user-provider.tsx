
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useLanguage } from './language-provider';
import { useAuth } from './auth-provider';

type UserData = {
  userName: string;
  avatarUrl: string;
};

type UserProviderState = UserData & {
  updateUser: (data: Partial<UserData>) => void;
};

const UserContext = createContext<UserProviderState | undefined>(undefined);

const defaultUserNames = {
  es: "Usuario de Zenith",
  en: "Zenith User"
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const { user } = useAuth(); // Get user from AuthContext

  const [userData, setUserData] = useState<UserData>({
    userName: "",
    avatarUrl: "https://placehold.co/100x100.png"
  });

  useEffect(() => {
    // This effect runs on the client and syncs the user's display name
    // from Firebase Auth to the local state.
    if (user) {
      setUserData(prev => ({ 
        ...prev, 
        userName: user.displayName || defaultUserNames[language] 
      }));
    } else {
      // Handle case where user logs out
      setUserData(prev => ({ 
        ...prev, 
        userName: defaultUserNames[language] 
      }));
    }
  }, [user, language]);


  const updateUser = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
    // Here you would also update the user profile in Firebase if needed, e.g.
    // if (user && data.userName) {
    //   updateProfile(user, { displayName: data.userName });
    // }
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
