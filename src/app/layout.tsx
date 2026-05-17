import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { GenesisProvider } from "@/context/GenesisContext";
import { GenesisModal } from "@/components/GenesisModal";
import { PersonaProvider } from "@/context/PersonaContext";
import { AgentPanel } from "@/components/AgentPanel";
import { MainLayoutWrapper } from "@/components/MainLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartStream AI-CFM",
  description: "AI-Driven Continuous Flow Methodology Project Management",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-screen flex flex-col bg-background text-foreground transition-colors duration-500 overflow-hidden w-full relative" suppressHydrationWarning>
        <ThemeProvider>
          <PersonaProvider>
            <GenesisProvider>
              <Sidebar />
              <GlobalHeader />
              <Suspense fallback={null}>
                <GenesisModal />
              </Suspense>
              <AgentPanel />
              <main className="flex-1 min-h-0 ml-20 pt-16 overflow-y-auto w-[calc(100%-5rem)]">
                <MainLayoutWrapper>
                  {children}
                </MainLayoutWrapper>
              </main>
            </GenesisProvider>
          </PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
