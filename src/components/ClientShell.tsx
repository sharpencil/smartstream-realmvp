'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useOrg } from '@/context/OrgContext';
import { Sidebar } from '@/components/Sidebar';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AgentPanel } from '@/components/AgentPanel';
import { MainLayoutWrapper } from '@/components/MainLayoutWrapper';
import { GenesisModal } from '@/components/GenesisModal';
import { usePathname, useRouter } from 'next/navigation';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { orgState, loaded } = useOrg();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Automatic client-side redirect guard if fully loaded but has no organization workspace
  useEffect(() => {
    if (mounted && loaded && orgState === null && pathname !== '/sign-up') {
      router.push('/sign-up');
    }
  }, [mounted, loaded, orgState, pathname, router]);

  if (!mounted || !loaded) {
    // Return a clean loading screen during server layout and client hydration
    return (
      <main className="flex-1 min-h-0 w-full h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Syncing workspace...
        </div>
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
