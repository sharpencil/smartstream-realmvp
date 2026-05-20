'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useOrg } from '@/context/OrgContext';
import { Sidebar } from '@/components/Sidebar';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AgentPanel } from '@/components/AgentPanel';
import { MainLayoutWrapper } from '@/components/MainLayoutWrapper';
import { GenesisModal } from '@/components/GenesisModal';
import { usePathname } from 'next/navigation';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { orgState } = useOrg();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return standard skeleton or loading during initial hydration
    return (
      <main className="flex-1 min-h-0 w-full overflow-y-auto bg-slate-950">
        {children}
      </main>
    );
  }

  // Hide sidebar/header/panels if no organization is configured yet,
  // or if the user is explicitly on the signup page.
  const hasWorkspace = orgState !== null;
  const isSignUpPage = pathname === '/sign-up';
  const showShell = hasWorkspace && !isSignUpPage;

  if (!showShell) {
    return (
      <main className="flex-1 min-h-0 w-full overflow-y-auto">
        {children}
      </main>
    );
  }

  return (
    <>
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
    </>
  );
}
