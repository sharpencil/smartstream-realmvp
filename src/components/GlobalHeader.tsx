'use client';

import { useState } from 'react';
import { ChevronDown, Search, Bell, Plus, Check } from 'lucide-react';
import { useGenesis } from '@/context/GenesisContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { cn } from '@/lib/utils';
import { usePersona } from '@/context/PersonaContext';
import { Button } from './ui/Button';

const organizations = [
  "Acme Corp",
  "Global Logistics",
  "CyberDyne Systems",
  "Stark Industries",
  "Umbrella Corp",
];

const projects = [
  "Project Phoenix",
  "Arctic Pulse",
  "Genesis Protocol",
  "Nebula Stream",
  "Solar Flare",
];

export function GlobalHeader() {
  const { openGenesis } = useGenesis();
  const { activePersona } = usePersona();
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-border dark:border-white/15 z-[300] px-6 flex items-center justify-between shadow-sm dark:shadow-none transition-all duration-500">
      <div className="flex items-center gap-12">
        {/* Logo */}
        <div className="h-12 min-w-[48px] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/SmartStreamLogo.svg" alt="SmartStream Logo" className="h-full w-auto object-contain dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] dark:invert-[0.05]" />
        </div>

        {/* Organization & Project Selectors */}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground dark:text-slate-300">
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-[34px] flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100/80 dark:bg-slate-800/30 px-3 rounded-[12px] group focus:outline-none border border-black/[0.03] dark:border-transparent">
                <span className="text-[11px] font-bold uppercase tracking-wider">{selectedOrg}</span>
                <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-black/[0.05] dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-none rounded-[16px]">
              <div className="flex flex-col gap-1">
                {organizations.map((org) => (
                  <button
                    key={org}
                    onClick={() => setSelectedOrg(org)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-[12px] text-left text-[11px] font-bold uppercase tracking-widest transition-all duration-200",
                      selectedOrg === org 
                        ? "text-slate-900 dark:text-teal-400 bg-white dark:bg-teal-400/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-black/[0.02] dark:border-teal-500/20" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    {org}
                    {selectedOrg === org && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-teal-400" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">/</span>

          <Popover>
            <PopoverTrigger asChild>
              <button className="h-[34px] flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-all bg-cyan-500/[0.08] dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-100 px-3 rounded-[12px] border border-cyan-500/10 dark:border-cyan-500/10 group focus:outline-none shadow-sm shadow-cyan-500/5">
                <span className="text-[11px] font-bold uppercase tracking-wider">{selectedProject}</span>
                <ChevronDown className="w-4 h-4 opacity-50 text-cyan-600 dark:text-cyan-400 group-hover:opacity-100 transition-opacity" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-black/[0.05] dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-none rounded-[16px]">
              <div className="flex flex-col gap-1">
                {projects.map((project) => (
                  <button
                    key={project}
                    onClick={() => setSelectedProject(project)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-[12px] text-left text-[11px] font-bold uppercase tracking-widest transition-all duration-200",
                      selectedProject === project 
                        ? "text-slate-900 dark:text-teal-400 bg-white dark:bg-teal-400/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-black/[0.02] dark:border-teal-500/20" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    {project}
                    {selectedProject === project && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-teal-400" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* New Project Action (Hidden for Team Members) */}
        {activePersona !== 'Team Member' && (
          <Button
            variant="secondary"
            onClick={openGenesis}
            className="h-[34px] px-4 text-[10px] gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}

        {/* Search */}
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search drops, team..."
            className="w-64 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-[16px] py-1.5 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950"></span>
        </button>
      </div>
    </header>
  );
}
