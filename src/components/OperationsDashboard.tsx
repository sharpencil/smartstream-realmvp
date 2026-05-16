'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Coins, Activity, Shield, Server, Box, 
  Plus, Download, RefreshCw, AlertCircle, CheckCircle2, 
  Building, ShieldCheck, Database, X, Zap, Cpu,
  Globe, Lock, HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePersona } from '@/context/PersonaContext';
import { Button } from './ui/Button';

export function OperationsDashboard() {
  const [tokens, setTokens] = useState(124500);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [intelligenceDepth, setIntelligenceDepth] = useState(70);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 20));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentBurn = tokens / 100;
  const estimatedBurn = 1850.00;
  const burnPercent = (currentBurn / estimatedBurn) * 100;

  return (
    <div className="w-full bg-transparent pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 dark:bg-background/95 backdrop-blur-md px-8 pt-8 pb-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-foreground flex items-center gap-3">
            Operations
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Bioluminescent Background Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-5 dark:opacity-30">
         {Array.from({ length: 40 }).map((_, i) => (
          <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-border opacity-50 dark:opacity-100" style={{ left: i * 80 }} />
         ))}
         {Array.from({ length: 20 }).map((_, i) => (
           <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-border opacity-50 dark:opacity-100" style={{ top: i * 80 }} />
         ))}
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col z-10 px-8 pt-8 relative">
        
        {/* Top Row: Fiscal & Scale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Fiscal Health Card */}
          <div className="lg:col-span-2 bg-card backdrop-blur-md border border-border rounded-3xl p-8 relative overflow-hidden group shadow-arctic dark:shadow-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Project Token Burn</p>
                <h2 className="text-5xl font-bold text-card-foreground font-mono tracking-tight mb-4">
                  ${currentBurn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    <span>Budget Efficiency</span>
                    <span>{burnPercent.toFixed(1)}% consumed</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted border border-border overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
                      style={{ width: `${burnPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Projected end-of-cycle burn: <span className="text-foreground font-bold">${estimatedBurn.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="primary"
                  onClick={() => setIsSliderModalOpen(true)}
                  className="px-6 py-3 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Scale AI Context
                </Button>
                <Button 
                  variant="secondary"
                  className="px-6 py-3 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Financial Audit
                </Button>
              </div>
            </div>
          </div>

          {/* Infrastructure Health Card */}
          <div className="bg-card backdrop-blur-md border border-border rounded-3xl p-8 flex flex-col justify-between group shadow-arctic dark:shadow-none">
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-muted-foreground" />
                Infrastructure Load
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    <span>CPU Capacity</span>
                    <span className="text-emerald-500 dark:text-emerald-400">42%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-emerald-500 w-[42%] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    <span>Memory Usage</span>
                    <span className="text-emerald-500 dark:text-emerald-400">58%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-emerald-500 w-[58%] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
              <Globe className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs text-muted-foreground font-medium italic">Active Region: us-east-1</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Security & API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Security & Compliance */}
          <div className="bg-card backdrop-blur-md border border-border rounded-3xl p-8 shadow-arctic dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                Security Posture
              </h3>
              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                SOC2 COMPLIANT
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-2xl border border-border flex items-start gap-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-card-foreground uppercase tracking-widest mb-1">Encryption</p>
                  <p className="text-[10px] text-muted-foreground">AES-256 at rest & transit</p>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-2xl border border-border flex items-start gap-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-card-foreground uppercase tracking-widest mb-1">Data Residency</p>
                  <p className="text-[10px] text-muted-foreground">Encrypted Local Storage</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Active Guardrails</p>
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
                <span className="text-sm font-semibold text-card-foreground">Prompt Injection Shield</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">Verified</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
                <span className="text-sm font-semibold text-card-foreground">PII Redaction Engine</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>

          {/* API Health & Latency */}
          <div className="bg-card backdrop-blur-md border border-border rounded-3xl p-8 shadow-arctic dark:shadow-none">
             <h3 className="text-lg font-bold text-card-foreground mb-8 flex items-center gap-2">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                API Uptime & Latency
              </h3>
              
              <div className="space-y-6">
                {[
                  { name: 'AI Orchestrator', latency: '1240ms', uptime: '99.98%', status: 'Operational' },
                  { name: 'Vector Database', latency: '42ms', uptime: '100%', status: 'Operational' },
                  { name: 'Streaming Bus', latency: '8ms', uptime: '99.99%', status: 'Degraded' },
                  { name: 'Identity Service', latency: '115ms', uptime: '100%', status: 'Operational' },
                ].map((api) => (
                  <div key={api.name} className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border group hover:border-cyan-500/20 transition-all shadow-sm dark:shadow-none">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-card-foreground">{api.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{api.latency} response</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-1",
                        api.status === 'Operational' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}>
                        {api.status}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">{api.uptime} uptime</span>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

      </div>

      {/* Slider Modal Overlay */}
      <AnimatePresence>
        {isSliderModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-sm dark:shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    AI Intelligence Depth
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Adjust Token Consumption Level</p>
                </div>
                <button 
                  onClick={() => setIsSliderModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                  <span className="text-muted-foreground">Lite (Faster)</span>
                  <span className="text-indigo-400">Deep (Heavy)</span>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={intelligenceDepth}
                  onChange={(e) => setIntelligenceDepth(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-6 border border-border"
                />
                
                <div className="p-4 bg-muted border border-border rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-card-foreground">Projected Context Depth</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{intelligenceDepth}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    {intelligenceDepth > 80 ? "Maximum depth. High token usage, comprehensive analysis." : 
                     intelligenceDepth > 40 ? "Balanced mode. Standard token usage, moderate analysis." : 
                     "Fast mode. Low token usage, surface-level analysis."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="secondary"
                  onClick={() => setIsSliderModalOpen(false)}
                  className="px-5 py-2 text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => setIsSliderModalOpen(false)}
                  className="px-5 py-2 text-sm"
                >
                  Commit Scaling
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
