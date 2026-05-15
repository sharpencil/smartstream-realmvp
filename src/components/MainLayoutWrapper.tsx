'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePersona } from '@/context/PersonaContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export function MainLayoutWrapper({ children }: { children: ReactNode }) {
  const { isAgentOpen } = usePersona();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div 
      initial={false}
      animate={{ 
        backgroundColor: mounted ? (theme === 'dark' ? '#020617' : '#f8fafc') : '#020617',
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={cn("min-h-full w-full transition-all duration-500", isAgentOpen ? "pr-[360px]" : "pr-0")}
    >
      {children}
    </motion.div>
  );
}
