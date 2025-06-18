'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';
const THEMES = ['light', 'halloween'] as const;

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<typeof THEMES[number]>('light');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as typeof THEMES[number] | null;
    const initial = stored ?? 'light';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'halloween' : 'light';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <>
      <button onClick={toggleTheme} className="btn btn-sm fixed top-2 right-2 z-50">
        Theme: {theme}
      </button>
      {children}
    </>
  );
}
