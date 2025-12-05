'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';
const THEMES = ['fantasy', 'forest'] as const;

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Set default state to 'forest' (Dark Mode)
  const [theme, setTheme] = useState<typeof THEMES[number]>('forest');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as typeof THEMES[number] | null;
    // Fallback to 'forest' if no preference is stored
    const initial = stored ?? 'forest';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  return <>{children}</>;
}