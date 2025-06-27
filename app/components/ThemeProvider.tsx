'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';
const THEMES = ['cupcake', 'halloween'] as const;

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<typeof THEMES[number]>('cupcake');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as typeof THEMES[number] | null;
    const initial = stored ?? 'cupcake';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'cupcake' ? 'halloween' : 'cupcake';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <>
      <button onClick={toggleTheme} className="btn btn-sm fixed z-50">
        Theme: {theme}
      </button>
      {children}
    </>
  );
}
