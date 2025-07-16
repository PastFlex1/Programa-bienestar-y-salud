"use client";

import * as React from "react";

type Language = "es" | "en";

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const initialState: LanguageProviderState = {
  language: "es",
  setLanguage: () => null,
};

const LanguageProviderContext = React.createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "es",
  storageKey = "zenith-language",
  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = React.useState<Language>(() => {
    if (typeof window === 'undefined') {
      return defaultLanguage;
    }
    try {
      return (localStorage.getItem(storageKey) as Language) || defaultLanguage;
    } catch (e) {
      return defaultLanguage;
    }
  });

  React.useEffect(() => {
     if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        root.lang = language;
        localStorage.setItem(storageKey, language);
     }
  }, [language, storageKey]);

  const value = {
    language,
    setLanguage: (lang: Language) => {
      setLanguage(lang);
    },
  };

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = React.useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");

  return context;
};
