import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import amLocale from '../locales/am.json';
import omLocale from '../locales/om.json';
import enLocale from '../locales/en.json';
import { SupportedLanguage } from '../types/index';

type TranslationKey = keyof typeof enLocale;

const translations: Record<SupportedLanguage, Record<string, string>> = {
  am: amLocale,
  om: omLocale,
  en: enLocale
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: TranslationKey | string, fallback?: string) => string;
}

export const I18nContext = createContext<I18nContextType>({
  language: 'am',
  setLanguage: async () => {},
  t: (key: string) => key
});

const LANGUAGE_KEY = '@siralink_language';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('am');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
      if (saved && (saved === 'am' || saved === 'om' || saved === 'en')) {
        setLanguageState(saved as SupportedLanguage);
      }
    });
  }, []);

  const setLanguage = async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (key: TranslationKey | string, fallback?: string): string => {
    const dict = translations[language] || translations.am;
    return dict[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
