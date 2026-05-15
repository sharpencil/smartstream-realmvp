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
  const hasAnyException = blockerCount > 0 || forecastSlipHours > 0 || blockerResolutio        <div className="flex flex-col gap-10">
          <div className="flex gap-8 items-start">
            {/* Task 1: Narrative Oracle Briefing */}
            <div className="flex-[2.5] relative group/briefing">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-500/60" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Oracle Briefing</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
              </div>
              <p className="text-3xl font-serif text-slate-900 dark:text-slate-100 leading-[1.4] tracking-tight">
                Phoenix is on forecast for <span className="text-indigo-600 dark:text-indigo-400 italic">June 12</span> at <span className="text-emerald-600 dark:text-emerald-400">92% confidence</span>.
              </p>
              <p className="text-sm text-muted-foreground/60 mt-4 leading-relaxed font-light tracking-wide max-w-2xl">
                Confidence rose 5% since CDC cleared the dependency on legacy auth. Infrastructure load remains stable at nominal levels.
              </p>
            </div>

            {/* Project Burndown */}
            <div 
              onClick={onBurndownClick}
              className="flex-[1] flex flex-col justify-start group transition-all duration-500 relative cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">Burndown</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tighter">72%</span>
                  <BurndownChart />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">on track</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0 w-full">
            {/* Throughput */}
            <div className="flex-1 px-8 border-r border-gradient-v flex flex-col gap-2 group cursor-pointer">
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Throughput</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">14.2</span>
                <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">▲ 8%</span>
              </div>
            </div>

            {/* Capacity Used */}
            <div
              onClick={onCapacityClick}
              className="flex-1 px-8 border-r border-gradient-v flex flex-col gap-2 group cursor-pointer"
            >
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Capacity</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">87%</span>
                <span className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest">2 Alert</span>
              </div>
            </div>

            {/* On-Time Drop Rate */}
            <div className="flex-1 px-8 border-r border-gradient-v flex flex-col gap-2 group cursor-pointer">
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Velocity</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">91%</span>
                <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">▲ 3%</span>
              </div>
            </div>

            {/* Forecast Stability */}
            <div className="flex-1 px-8 flex flex-col gap-2 group cursor-pointer">
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Stability</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">±1.2</span>
                <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">Tight</span>
              </div>
            </div>
          </div>
        </div>g-none">tight band</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
