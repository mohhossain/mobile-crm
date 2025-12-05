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
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Pulse",
  description: "The intelligent operating system for your business.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <ClerkProvider>
      <ThemeProvider>
        <html lang="en" className="h-full bg-base-300" suppressHydrationWarning>
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
          <body className="h-full overflow-hidden bg-base-300">
            
            {/* Authenticated Layout - Fixed Viewport */}
            <SignedIn>
              <div className="flex h-full w-full">
                
                {/* Sidebar: Stays fixed on the left (hidden on mobile) */}
                <div className="hidden lg:block flex-none h-full">
                   <Sidebar />
                </div>

                {/* Right Content Column */}
                <div className="flex-1 flex flex-col h-full min-w-0 relative">
                  
                  {/* Header: Fixed at top of content column */}
                  <header className="flex-none h-16 pt-safe flex justify-between items-center px-6 gap-4 bg-base-100/50 backdrop-blur-md z-40 border-b border-base-200 lg:bg-transparent lg:border-none">
                    
                    <div className="flex items-center gap-2 lg:hidden">
                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                       <span className="font-mono text-[10px] font-bold tracking-widest opacity-50 border border-base-content/20 px-1.5 py-0.5 rounded">
                         v1.3 BETA
                       </span>
                    </div>
                    
                    <div className="hidden lg:block"></div>

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

                  {/* Scrollable Main Content */}
                  <main className="flex-1 overflow-y-auto overflow-x-hidden w-full px-4 pt-4 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                       {children}
                    </div>
                    {/* Spacer for Mobile Dock so content isn't hidden */}
                    <div className="h-28 lg:h-12"></div>
                  </main>

                  {/* Dock: Fixed at bottom (hidden on desktop) */}
                  <Dock />
                </div>
              </div>
            </SignedIn>

            {/* Public Layout - Allow dynamic pages (like Profile) to render */}
            <SignedOut>
              <main className="h-full w-full overflow-y-auto bg-base-300">
                 {/* FIX: Render children here so public routes (/p/...) work. 
                     The HomePage component will handle showing LandingPage if visited at root. */}
                 {children}
              </main>
            </SignedOut>

          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}