'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Suppress the React 19 script tag warning until next-themes is updated
// This is a known false positive: the script is intended for server-side injection
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
