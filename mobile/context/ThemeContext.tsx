import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@siralink_theme_mode';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceCard: string;
  surfaceSubtle: string;
  surfaceHover: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryGlow: string;
  accent: string;
  accentLight: string;
  accentGlow: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  cardShadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceHover: '#E2E8F0',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  primary: '#2563EB', // Consistent Modern Royal Blue
  primaryLight: '#DBEAFE',
  primaryGlow: 'rgba(37, 99, 235, 0.12)',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  accentGlow: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  cardShadow: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  }
};

export const darkColors: ThemeColors = {
  background: '#0B0F19',
  surface: '#111827',
  surfaceCard: '#1E293B',
  surfaceSubtle: '#1E293B',
  surfaceHover: '#26354D',
  border: '#334155',
  borderSubtle: '#172033',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#3B82F6', // Clear Vibrant Blue
  primaryLight: '#1E3A8A',
  primaryGlow: 'rgba(59, 130, 246, 0.20)',
  accent: '#FBBF24',
  accentLight: 'rgba(251, 191, 36, 0.18)',
  accentGlow: 'rgba(251, 191, 36, 0.25)',
  danger: '#F87171',
  dangerLight: 'rgba(248, 113, 113, 0.18)',
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.18)',
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  }
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          setThemeState(saved);
        } else if (systemScheme === 'dark') {
          setThemeState('dark');
        }
      } catch (err) {
        console.warn('Error reading theme mode preference:', err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, [systemScheme]);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn('Error saving theme mode preference:', err);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
