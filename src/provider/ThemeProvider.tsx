'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TThemeMode } from 'src/types';

type ThemeContextType = {
  theme: TThemeMode;
  setTheme: (theme: TThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): TThemeMode => {
  if (typeof window === 'undefined') return 'light';

  const storedTheme = localStorage.getItem('theme') as TThemeMode | null;
  if (storedTheme) return storedTheme;

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDarkMode ? 'dark' : 'light';
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<TThemeMode>(getInitialTheme);

  const applyTheme = (newTheme: TThemeMode) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = (newTheme: TThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme: TThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme('dark'); // NOTE: dark matter
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
