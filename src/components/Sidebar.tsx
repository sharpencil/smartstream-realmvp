'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, LayoutDashboard, Users, 
  GitCommit, Map, Brain, Shield, Calendar, LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona, PersonaType } from '@/context/PersonaContext';
import { useOrg } from '@/context/OrgContext';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const PERSONA_MENUS: Record<PersonaType, Array<{ name: string; icon: any; href: string }>> = {
  'Admin': [
    { name: 'Admin Cockpit', icon: Shield, href: '#' },
  ],
  'Project Owner': [],
  'Project Manager': [
    { name: 'Pulse', icon: Activity, href: '/' },
    { name: 'Streams', icon: LayoutDashboard, href: '/library' },
    { name: 'Team', icon: Users, href: '/team' },
  ],
  'Team Member': [
    { name: 'My Flow', icon: GitCommit, href: '/' },
    { name: 'Project Map', icon: Map, href: '/map' },
  ],
};

const PERSONA_ORDER: PersonaType[] = ['Admin', 'Project Owner', 'Project Manager', 'Team Member'];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activePersona, setActivePersona, isTransitioning, setIsTransitioning } = usePersona();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePersonaSwitch = (persona: PersonaType) => {
    if (persona === activePersona) {
      setPopoverOpen(false);
      return;
    }
    setPopoverOpen(false);
    setIsTransitioning(true);
    
    // Switch persona slightly after ripple starts
    setTimeout(() => {
      setActivePersona(persona);
      router.push('/');
    }, 200);

    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const pillars = PERSONA_MENUS[activePersona];
  const { activeAdminTab, setActiveAdminTab, orgState, clearWorkspace } = useOrg();

  const displayName = orgState ? orgState.fullName : 'John Doe';
  const displayEmail = orgState ? orgState.workEmail : 'john@example.com';
  const displayInitials = orgState 
    ? orgState.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 3) 
    : 'JD';

  return (
    <>
      <aside className="fixed top-16 bottom-0 left-0 w-20 flex flex-col items-center py-8 bg-background border-r border-border dark:border-white/10 z-[200] shadow-sm dark:shadow-none">
        
        <nav className="flex-1 flex flex-col gap-8 w-full items-center mt-4">
          <AnimatePresence mode="wait">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              
              const isActive = activePersona === 'Admin'
                ? pillar.name === 'Admin Cockpit'
                : pathname === pillar.href || (pathname === '' && pillar.href === '/');

              const handleClick = (e: React.MouseEvent) => {
                if (activePersona === 'Admin') {
                  e.preventDefault();
                }
              };
              
              return (
                <motion.div
                  key={pillar.name + activePersona}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    href={pillar.href}
                    onClick={handleClick}
                    className={cn(
                      "group relative p-3 rounded-[20px] transition-all duration-300 block",
                      isActive 
                        ? "bg-white dark:bg-teal-950/40 text-slate-900 dark:text-teal-400 border border-black/[0.03] dark:border-teal-500/30 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-none" 
                        : "text-muted-foreground hover:text-slate-900 hover:bg-slate-100/80 dark:hover:text-teal-400 dark:hover:bg-teal-950/30 border border-transparent hover:border-black/[0.02] dark:hover:border-transparent"
                    )}
                  >
                    <Icon className="w-6 h-6 stroke-[1.5]" />
                    <span className="sr-only">{pillar.name}</span>
                    
                    {/* Hover Indicator (Cyan Dot) */}
                    {!isActive && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}

                    {/* Tooltip */}
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-none whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:-left-1 before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-white dark:before:border-r-slate-800 backdrop-blur-md z-50">
                      {pillar.name}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>
        
        <div className="mt-auto flex flex-col items-center gap-6 mb-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-[20px] bg-muted dark:bg-white/5 border border-border dark:border-white/5 text-muted-foreground hover:text-foreground shadow-sm dark:shadow-none"
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            {!mounted && <div className="w-5 h-5" />}
          </button>

          <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Popover.Trigger asChild>
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:border-teal-500/50 transition-all duration-300 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-none group-hover:shadow-teal-500/10">
                  <span className="text-slate-900 dark:text-slate-200 font-bold text-xs tracking-tighter">{displayInitials}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a192f] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            </Popover.Trigger>
 
            <Popover.Portal>
              <Popover.Content 
                side="right" 
                align="end" 
                sideOffset={16}
                className="z-[250] w-56 rounded-[16px] bg-white dark:bg-[#0a192f] border border-black/[0.05] dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-2xl p-2 outline-none animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
              >
                <div className="px-3 py-3 mb-2 border-b border-black/[0.03] dark:border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-teal-950/40 flex items-center justify-center border border-black/[0.03] dark:border-teal-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
                      <span className="text-slate-900 dark:text-teal-400 text-[10px] font-bold">{displayInitials}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate font-mono">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md mb-2">
                    <Shield className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest truncate">
                      {orgState ? 'Workspace Admin' : 'Demo Profile'}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">Identity Context</p>
                </div>
                <div className="flex flex-col gap-1">
                  {PERSONA_ORDER.map((persona) => {
                    const isComingSoon = persona === 'Project Owner';
                    return (
                    <button
                      key={persona}
                      onClick={() => !isComingSoon && handlePersonaSwitch(persona)}
                      disabled={isComingSoon}
                      className={cn(
                        "flex items-center w-full px-3 py-2 text-sm rounded-xl transition-all duration-200",
                        isComingSoon
                          ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                          : activePersona === persona 
                            ? "bg-white dark:bg-teal-950/40 text-slate-900 dark:text-teal-400 font-medium border border-black/[0.03] dark:border-teal-500/30 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-none" 
                            : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <span className="truncate">{persona}</span>
                      {!isComingSoon && activePersona === persona && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                      )}
                      {isComingSoon && (
                        <span className="ml-auto text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          Soon
                        </span>
                      )}
                    </button>
                    );
                  })}
                </div>

                {/* Log Out */}
                <div className="mt-1 pt-1 border-t border-black/[0.03] dark:border-white/10">
                  <button
                    onClick={() => {
                      setPopoverOpen(false);
                      clearWorkspace();
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl transition-all duration-200 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </aside>

      {/* Liquid Ripple Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="fixed z-[40] w-10 h-10 rounded-full bg-teal-500/20 pointer-events-none"
            style={{ 
              bottom: '2rem', 
              left: '1.25rem', // roughly matching the avatar position
              transformOrigin: 'center center'
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
