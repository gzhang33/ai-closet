import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

const LANGUAGE_KEY = "@ai_closet_language";

type Language = "en" | "zh";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(
    (i18n.language as Language) || "en"
  );
  const [isReady, setIsReady] = useState(false);

  const setLanguage = useCallback(async (lang: Language) => {
    await i18n.changeLanguage(lang);
    setLanguageState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved === "en" || saved === "zh") {
        await i18n.changeLanguage(saved);
        setLanguageState(saved);
      }
      setIsReady(true);
    })();
  }, []);

  if (!isReady) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

export default LanguageContext;
