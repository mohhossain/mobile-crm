"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "@capacitor/splash-screen";

export default function SplashAnimation({ onComplete }: { onComplete: () => void }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 1. Hide the native static splash screen immediately when this component mounts
    // This creates a seamless transition from Native Image -> React SVG Animation
    const hideNativeSplash = async () => {
      await SplashScreen.hide();
    };
    
    hideNativeSplash();

    // 2. Play animation for a set time (e.g., 2 seconds)
    const timer = setTimeout(() => {
      setIsFading(true);
      // Allow fade-out transition to finish before unmounting
      setTimeout(onComplete, 500); 
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-base-100 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Pulse Logo SVG Animation */}
        <svg
          className="w-32 h-32 text-primary"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring - Ping Effect */}
          <circle 
            cx="50" cy="50" r="45" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="opacity-20 animate-ping-slow origin-center" 
          />
          
          {/* Inner Ring */}
          <circle 
            cx="50" cy="50" r="35" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="opacity-40" 
          />
          
          {/* Pulse Heartbeat Path - Draw Effect */}
          <path 
            d="M30 50 L40 50 L45 35 L55 65 L60 50 L70 50" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="animate-draw-path"
          />
        </svg>
        
        <h1 className="mt-8 text-2xl font-black tracking-widest uppercase text-base-content animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          Pulse
        </h1>
      </div>

      <style jsx>{`
        @keyframes draw-path {
          0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
          100% { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-draw-path {
          animation: draw-path 1.5s ease-out forwards;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}