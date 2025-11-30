'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';
const THEMES = ['light', 'halloween'] as const;

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Set default state to 'halloween' (Dark Mode)
  const [theme, setTheme] = useState<typeof THEMES[number]>('halloween');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as typeof THEMES[number] | null;
    // Fallback to 'halloween' if no preference is stored
    const initial = stored ?? 'halloween';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  return <>{children}</>;
}