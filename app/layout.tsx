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
// import PulseBot from "./components/PulseBot"; // Import Bot

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
          <body className="flex flex-col min-h-screen bg-base-300 overflow-x-hidden">
            
            {/* Authenticated Layout */}
            <SignedIn>
              <header className="flex-none h-16 flex justify-end items-center px-6 gap-4 bg-base-100/50 backdrop-blur-md sticky top-0 z-50 border-b border-base-200">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-9 h-9",
                      userButtonAvatarImage: "rounded-full",
                    },
                  }}
                />
                <SyncUser />
              </header>

              <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-28 pt-4">
                {children}
                <Dock />
                {/* <PulseBot /> Add Bot Here */}
              </main>
            </SignedIn>

            {/* Public Layout */}
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