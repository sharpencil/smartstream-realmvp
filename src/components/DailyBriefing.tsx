'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AlertTriangle, TrendingUp, X, Activity, Brain, TrendingDown, Link2, Maximize2, Coins, Zap, Target, Users, Shield, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { BurndownChart } from './BurndownChart';
import { cn } from '@/lib/utils';
import { usePersona } from '@/context/PersonaContext';

interface DailyBriefingProps {
  blockerCount: number;
  forecastSlipHours: number;
  forecastSlipStream: string;
  isAgentOpen?: boolean;
  onDismissBlocker?: () => void;
  onDismissForecast?: () => void;
  onClickBlocker?: () => void;
  blockerResolutionCount?: number;
  onDismissResolution?: () => void;
  onBurndownClick?: () => void;
  onCapacityClick?: () => void;
}

const rowVariants: Variants = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: {
    opacity: 1, height: 'auto', marginTop: 8,
    transition: { type: 'spring' as const, stiffness: 340, damping: 30, opacity: { duration: 0.2 } },
  },
  exit: {
    opacity: 0, height: 0, marginTop: 0,
    transition: { duration: 0.22, ease: 'easeIn' as const },
  },
};

const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.16, ease: 'easeIn' as const } },
};

// ── Shared widget shell ───────────────────────────────────────────────────────
function Widget({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : {}}
      className={cn(
        'relative flex items-center gap-3 px-4 h-[66px] rounded-2xl transition-all duration-200',
        'bg-card border border-border shadow-sm dark:shadow-none',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function DailyBriefing({
  blockerCount,
  forecastSlipHours,
  forecastSlipStream,
  isAgentOpen,
  onDismissBlocker,
  onDismissForecast,
  onClickBlocker,
  blockerResolutionCount = 0,
  onDismissResolution,
  onBurndownClick,
  onCapacityClick,
}: DailyBriefingProps) {
  const { activePersona } = usePersona();
  const hasAnyException = blockerCount > 0 || forecastSlipHours > 0 || blockerResolutionCount > 0;

  return (
    <div className="relative z-20 bg-transparent">
      <div className="py-5 relative">

        <div className="flex gap-2.5 mb-2.5">
          <div className="flex flex-col gap-2.5 w-full">
            <div className="flex gap-2.5 w-full items-stretch">
              {/* Task 1: Narrative Oracle Briefing */}
              <div className="flex-[2.5] bg-card border border-border dark:border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden group shadow-sm dark:shadow-[inset_0_0_40px_rgba(99,102,241,0.05)]">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Oracle Briefing</span>
                </div>
                <p className="text-[14px] text-foreground font-medium leading-relaxed max-w-4xl">
                  Phoenix is on forecast for <span className="text-indigo-700 dark:text-indigo-400 font-bold">June 12</span> at <span className="text-emerald-700 dark:text-emerald-400 font-bold">92% confidence</span>. Confidence rose 5% since CDC cleared the dependency on legacy auth.
                </p>
              </div>

              {/* Project Burndown */}
              <div 
                onClick={onBurndownClick}
                className="flex-[1] bg-card border border-border rounded-2xl p-5 flex flex-col justify-center group hover:bg-muted transition-colors relative cursor-pointer gap-1.5 shadow-sm dark:shadow-none"
              >
                <div className="absolute top-4 right-4 z-20">
                  <div className="p-1.5 rounded-lg bg-muted border border-border text-muted-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:bg-background transition-all shadow-sm">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Project Burndown</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-bold text-foreground tracking-tight leading-none">72%</span>
                    <BurndownChart />
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 leading-none">on track</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-card backdrop-blur-md rounded-2xl border border-border flex flex-col sm:flex-row overflow-hidden shadow-arctic dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
              {/* Throughput */}
              <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-border flex flex-col justify-center group hover:bg-muted transition-colors relative cursor-pointer gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Throughput · 7D</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-foreground tracking-tight leading-none">14.2</span>
                    <span className="text-[10px] text-muted-foreground font-medium leading-none">drops/day</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 leading-none">▲ 8%</span>
                </div>
              </div>

              {/* Capacity Used */}
              <div
                onClick={onCapacityClick}
                className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-border flex flex-col justify-center group hover:bg-muted transition-colors relative cursor-pointer gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Capacity Used</span>
                  <span className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-foreground tracking-tight leading-none">87%</span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-500 leading-none">2 hot teammates</span>
                </div>
              </div>

              {/* On-Time Drop Rate */}
              <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-border flex flex-col justify-center group hover:bg-muted transition-colors relative cursor-pointer gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">On-Time Rate</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-foreground tracking-tight leading-none">91%</span>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 leading-none">▲ 3%</span>
                </div>
              </div>

              {/* Forecast Stability */}
              <div className="flex-1 p-4 flex flex-col justify-center group hover:bg-muted transition-colors relative cursor-pointer gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Forecast Stability</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-foreground tracking-tight leading-none">±1.2</span>
                    <span className="text-[10px] text-muted-foreground font-medium leading-none">days</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 leading-none">tight band</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
