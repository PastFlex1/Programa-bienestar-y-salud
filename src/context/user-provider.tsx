
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
  const { user, loading } = useAuth(); // Get user from AuthContext

  const [userName, setUserName] = useState(defaultUserNames[language]);
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100.png");

  useEffect(() => {
    // This effect runs on the client and syncs the user's display name
    // from Firebase Auth to the local state, once auth is no longer loading.
    if (!loading && user) {
        setUserName(user.displayName || defaultUserNames[language]);
        // Here you could also sync user.photoURL if you were storing it in Firebase Auth
    } else if (!loading && !user) {
      // Handle case where user logs out or session is invalid
      setUserName(defaultUserNames[language]);
    }
  }, [user, loading, language]);


  const updateUser = (data: Partial<UserData>) => {
    if(data.userName) {
      setUserName(data.userName);
    }
    if (data.avatarUrl) {
      setAvatarUrl(data.avatarUrl);
    }
    // Here you would also update the user profile in Firebase if needed, e.g.
    // if (user && data.userName) {
    //   updateProfile(user, { displayName: data.userName });
    // }
  };

  const value = useMemo(() => ({
    userName,
    avatarUrl,
    updateUser
  }), [userName, avatarUrl]);

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
