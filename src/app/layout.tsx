import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrgProvider } from "@/context/OrgContext";
import { ClientShell } from "@/components/ClientShell";
import { GenesisProvider } from "@/context/GenesisContext";
import { PersonaProvider } from "@/context/PersonaContext";

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
            <OrgProvider>
              <GenesisProvider>
                <ClientShell>
                  {children}
                </ClientShell>
              </GenesisProvider>
            </OrgProvider>
          </PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
