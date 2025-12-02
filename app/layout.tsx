import type { Metadata } from "next";
import Dock from "./components/Dock";
import Sidebar from "./components/Sidebar";
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
          {/* Global Layout Structure:
             - Mobile: Vertical Column
             - Desktop: Horizontal Row (Sidebar | Content)
          */}
          <body className="flex min-h-screen bg-base-300 overflow-x-hidden">
            
            {/* Authenticated Layout */}
            <SignedIn>
              
              {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
              <Sidebar />

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 flex flex-col min-w-0">
                
                {/* Top Header (Visible on both, but Sidebar handles Nav on Desktop) */}
                <header className="flex-none h-16 pt-safe flex justify-between items-center px-6 gap-4 bg-base-100/50 backdrop-blur-md sticky top-0 z-40 border-b border-base-200 lg:bg-transparent lg:border-none">
                  
                  {/* Mobile-Only Beta Badge (Sidebar has logo on desktop) */}
                  <div className="flex items-center gap-2 lg:hidden">
                     <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                     <span className="font-mono text-[10px] font-bold tracking-widest opacity-50 border border-base-content/20 px-1.5 py-0.5 rounded">
                       v1.2 BETA
                     </span>
                  </div>
                  
                  {/* Desktop Page Title (Optional, or keep blank for clean look) */}
                  <div className="hidden lg:block">
                     {/* Breadcrumbs could go here */}
                  </div>

                  {/* User Controls */}
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

                {/* Content Scroll Area */}
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-32 pt-4 lg:px-8 lg:pb-12">
                  {children}
                </main>

                {/* MOBILE DOCK (Hidden on Desktop) */}
                <Dock />
              </div>

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