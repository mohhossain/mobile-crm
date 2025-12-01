import type { Metadata } from "next";
import Dock from "./components/Dock";
import "./globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import SyncUser from "./components/SyncUser";
import ThemeProvider from "./components/ThemeProvider";
import LandingPage from "./components/LandingPage";

export const metadata: Metadata = {
  title: "Pulse",
  description: "The intelligent operating system for your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        {/* FIX: Removed hardcoded data-theme attribute.
          Instead, we use an inline script to check localStorage immediately.
          This prevents the "Flash of Incorrect Theme" on refresh.
        */}
        <html lang="en" className="bg-base-300">
          <head>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    try {
                      var localTheme = localStorage.getItem('theme');
                      var theme = localTheme || 'halloween';
                      document.documentElement.setAttribute('data-theme', theme);
                    } catch (e) {}
                  })();
                `,
              }}
            />
          </head>
          <body className="flex flex-col min-h-screen bg-base-300 overflow-x-hidden">
            
            {/* Authenticated Layout */}
            <SignedIn>
              {/* Header: Visible only when signed in */}
              <header className="flex-none h-16 flex justify-between items-center px-6 gap-4 bg-base-100/50 backdrop-blur-md sticky top-0 z-50 border-b border-base-200">
                
                {/* BETA BADGE (Left side) */}
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                   <span className="font-mono text-[10px] font-bold tracking-widest opacity-50 border border-base-content/20 px-1.5 py-0.5 rounded">
                     v1.1 BETA
                   </span>
                </div>

                {/* User Controls (Right side) */}
                <div className="flex items-center gap-4">
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-9 h-9",
                        userButtonAvatarImage: "rounded-full",
                      },
                    }}
                  />
                  <SyncUser />
                </div>
              </header>

              {/* Main App Container */}
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-28 pt-4">
                {children}
                <Dock />
              </main>
            </SignedIn>

            {/* Public Layout (Landing Page) */}
            <SignedOut>
              <main className="flex-1 w-full flex flex-col">
                <LandingPage />
              </main>
            </SignedOut>

          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}