"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

const THEMES = [
  { name: "Light", value: "fantasy", icon: SunIcon },
  { name: "Dark", value: "forest", icon: MoonIcon },
];

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState("fantasy");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") || "fantasy";
    setCurrentTheme(stored);
  }, []);

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {THEMES.map((t) => (
        <button
          key={t.value}
          onClick={() => changeTheme(t.value)}
          className={`btn h-auto py-4 flex flex-col items-center gap-2 transition-all ${
            currentTheme === t.value 
              ? "btn-primary ring-2 ring-primary ring-offset-2" 
              : "btn-outline border-base-300 hover:bg-base-200 hover:text-base-content"
          }`}
        >
          <t.icon className={`w-8 h-8 ${currentTheme === t.value ? "animate-pulse" : ""}`} />
          <span className="font-semibold">{t.name}</span>
        </button>
      ))}
    </div>
  );
}