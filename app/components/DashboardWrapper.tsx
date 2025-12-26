"use client";

import { useState } from "react";
import SplashAnimation from "./SplashAnimation";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <SplashAnimation onComplete={() => setIsLoading(false)} />}
      <div className={`transition-opacity duration-700 ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        {children}
      </div>
    </>
  );
}