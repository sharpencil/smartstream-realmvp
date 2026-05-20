'use client';

import { FileUp, Layers, UserPlus, Database, Fingerprint, Network, UserCheck, ChevronDown, ChevronRight, Rocket, Activity, Target, Briefcase, Search } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StreamAccordion } from './StreamAccordion';
import { DependencyMatrix } from './DependencyMatrix';
import { Button } from './ui/Button';


export function LibraryDashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'genesis' | 'dependencies'>('active');
  const [genesisState, setGenesisState] = useState<'idle' | 'uploading' | 'scanning' | 'complete' | 'approving' | 'synthesizing' | 'reviewed'>('idle');
  const [isTeamConfirmed, setIsTeamConfirmed] = useState(false);
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');


  const handleUpload = () => {
    if (genesisState !== 'idle') return;
    setGenesisState('uploading');
    setIsTeamConfirmed(false);
    setProgress(0);
    
    // Simulate file upload -> AI scan -> decompiled success
    let val = 0;
    const interval = setInterval(() => {
      val += Math.floor(Math.random() * 8) + 2;
      if (val >= 100) val = 100;
      
      setProgress(val);
      if (val >= 35 && val < 99) {
        setGenesisState(prev => prev === 'uploading' ? 'scanning' : prev);
      }
      
      if (val >= 100) {
        clearInterval(interval);
        setGenesisState('complete');
        
        // Auto-transition to Step 3 (Stream Approval)
        setTimeout(() => {
          setGenesisState('approving');
        }, 1800);
      }
    }, 200);
  };

  const handleConfirmTeam = () => {
    setIsTeamConfirmed(true);
    setGenesisState('approving');
  };

  const handleApproveStreams = () => {
    setGenesisState('synthesizing');
    setSynthesisProgress(0);
    
    let val = 0;
    const interval = setInterval(() => {
      val += Math.floor(Math.random() * 10) + 5;
      if (val >= 100) {
        val = 100;
        clearInterval(interval);
        setTimeout(() => {
          setGenesisState('reviewed');
        }, 800);
      }
      setSynthesisProgress(val);
    }, 250);
  };

  return (
    <div className="w-full flex flex-col transition-all duration-500 ease-in-out bg-transparent text-foreground pb-20">
      {/* View Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-border dark:border-white/5 shrink-0">
         <h1 className="text-3xl font-bold font-sans tracking-tight text-foreground dark:text-slate-100 flex items-center gap-3">
           Streams
         </h1>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 p-1 bg-slate-100/80 dark:bg-slate-900/60 border border-black/[0.03] dark:border-slate-800/60 rounded-full dark:shadow-inner dark:shadow-black/20 flex-nowrap h-auto">
            {[
              { id: 'active', label: 'Active Streams' },
              { id: 'dependencies', label: 'Stream Dependencies' },
              { id: 'genesis', label: 'Stream Genesis' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "relative px-6 py-2 rounded-full text-sm tracking-wide transition-colors outline-none whitespace-nowrap z-10",
                    isActive 
                      ? "text-slate-900 dark:text-teal-400 font-medium" 
                      : "text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground group"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPebbleLibrary"
                      className="absolute inset-0 bg-white dark:bg-teal-950/80 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-none border-none dark:border dark:border-teal-500/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20 font-bold uppercase text-[11px] tracking-widest">{tab.label}</span>
                  
                  {/* Hover Indicator (Teal Dot) */}
                  {!isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              );
            })}
          </div>
       </div>

       {/* TAB 1: ACTIVE STREAMS */}
       {activeTab === 'active' && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
           className="w-full flex-1 flex flex-col px-8 pt-8"
         >
           <div className="w-full flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 whitespace-nowrap">
               <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
               Active Streams
             </h2>
             <span className="text-sm text-muted-foreground">Atomic drops from these AI streams are executing currently in Pulse.</span>
           </div>
           
           <StreamAccordion type="active" />
         </motion.div>
       )}

       {/* TAB 2: DEPENDENCIES MATRIX */}
       {activeTab === 'dependencies' && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
           className="w-full flex-1 flex flex-col px-8 pt-8"
         >
           <div className="w-full flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 whitespace-nowrap">
               <Network className="w-5 h-5 text-teal-500 dark:text-teal-400 shrink-0" />
               Stream Dependencies
             </h2>
             <div className="relative">
               <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Find stream..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-background dark:bg-black/30 border border-border dark:border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-foreground dark:text-slate-300 focus:outline-none focus:border-teal-500/50 transition-colors w-48 shadow-sm dark:shadow-none" 
               />
             </div>
           </div>
            
            <div className="pb-8">
              <DependencyMatrix searchTerm={searchTerm} />
            </div>
         </motion.div>
       )}

       {/* TAB 3: STREAM GENESIS */}
       {activeTab === 'genesis' && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
           className="w-full flex-1 flex flex-col px-8 pt-8"
         >
           <div className="w-full flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 whitespace-nowrap">
               <Rocket className="w-5 h-5 text-purple-500 dark:text-purple-400 shrink-0" />
               Stream Genesis
             </h2>
             <span className="text-sm text-muted-foreground">Decompile requirements into manageable AI-driven execution streams.</span>
           </div>
           
           {genesisState !== 'reviewed' && (
             <div className="w-full flex gap-8 pb-8">
               {/* Left: Intake Dropzone */}
               <div 
                 className={cn(
                   "flex-[2] bg-card dark:bg-slate-900/40 border border-border dark:border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[280px] transition-all relative overflow-hidden",
                   genesisState === 'idle' ? "border-dashed hover:border-cyan-500/50 hover:bg-cyan-950/10 cursor-pointer group" : "border-solid shadow-inner shadow-cyan-900/10"
                 )} 
                 onClick={handleUpload}
               >
                  {genesisState === 'idle' && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-border dark:border-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-lg dark:shadow-black">
                        <FileUp className="w-8 h-8 text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">Drag & Drop Requirements</h3>
                      <p className="text-sm text-muted-foreground mt-2 font-light">Support for Jira Epics, PRDs, and FigJam links.</p>
                    </>
                  )}
                  
                  {(genesisState === 'uploading' || genesisState === 'scanning') && (
                    <div className="flex flex-col items-center w-full max-w-md z-10 transition-opacity">
                      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                        {genesisState === 'scanning' ? <Network className="w-8 h-8 text-teal-400 animate-pulse" /> : <Database className="w-8 h-8 text-cyan-400 animate-bounce" />}
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
                      </div>
                      
                      <div className="w-full flex justify-between text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">
                        <span>{genesisState === 'scanning' ? 'Neural Indexing Matrix...' : 'Ingesting Context...'}</span>
                        <span className={genesisState === 'scanning' ? "text-teal-600 dark:text-teal-400" : "text-cyan-600 dark:text-cyan-400"}>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner flex">
                        <motion.div 
                          className={cn("h-full transition-colors duration-500", genesisState === 'scanning' ? "bg-teal-400 shadow-sm dark:shadow-[0_0_10px_rgba(45,212,191,0.8)]" : "bg-cyan-400 shadow-sm dark:shadow-[0_0_10px_rgba(34,211,238,0.8)]")}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "linear" }}
                        />
                      </div>
                    </div>
                  )}

                   {/* Context Decoded State (Persists after Complete) */}
                    {(genesisState === 'complete' || genesisState === 'approving' || genesisState === 'synthesizing') && (
                     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center z-10">
                       <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-500/50 flex items-center justify-center mb-4 shadow-sm dark:shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                         <Fingerprint className="w-8 h-8 text-green-600 dark:text-green-400 drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                       </div>
                       <h3 className="text-xl font-bold text-green-600 dark:text-green-400 drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">Context Decoded</h3>
                       <div className="flex gap-4 mt-3">
                          <div className="px-3 py-1 bg-muted dark:bg-slate-900/60 rounded-lg border border-border dark:border-white/5 text-xs text-muted-foreground dark:text-slate-300 font-mono tracking-wide"><span className="text-cyan-400 font-bold">3</span> STREAMS</div>
                          <div className="px-3 py-1 bg-muted dark:bg-slate-900/60 rounded-lg border border-border dark:border-white/5 text-xs text-muted-foreground dark:text-slate-300 font-mono tracking-wide"><span className="text-teal-400 font-bold">14</span> DROPS</div>
                       </div>
                     </motion.div>
                   )}

                  {/* Background scanning simulation effects */}
                  {genesisState === 'scanning' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent w-[200%] h-[200%] animate-[shimmer_3s_infinite_linear] pointer-events-none" />
                  )}
               </div>

                {/* Right: Team Recommendations */}
                <div className="flex-1 bg-card dark:bg-slate-900/40 border border-border dark:border-slate-800/60 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                  <div className="flex items-center gap-3 mb-6 border-b border-border dark:border-white/5 pb-4">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">Oracle Team Alignments</h2>
                  </div>

                  {(genesisState === 'complete' || genesisState === 'approving' || genesisState === 'synthesizing') ? (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {[
                        { name: 'Sarah', role: 'Authentication', match: 98, color: 'green' },
                        { name: 'Mike', role: 'Database Arch', match: 92, color: 'teal' },
                        { name: 'Alex', role: 'UI / UX', match: 85, color: 'blue' }
                      ].map((p) => {
                        const styles = {
                          green: {
                            container: "dark:border-green-500/20 dark:shadow-green-900/10",
                            badge: "bg-white dark:bg-green-900/40 border-black/[0.03] dark:border-green-500/30 text-slate-900 dark:text-green-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                            percentage: "text-green-600 dark:text-green-400"
                          },
                          teal: {
                            container: "dark:border-teal-500/20 dark:shadow-teal-900/10",
                            badge: "bg-white dark:bg-teal-900/40 border-black/[0.03] dark:border-teal-500/30 text-slate-900 dark:text-teal-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                            percentage: "text-teal-600 dark:text-teal-400"
                          },
                          blue: {
                            container: "dark:border-blue-500/20 dark:shadow-blue-900/10",
                            badge: "bg-white dark:bg-blue-900/40 border-black/[0.03] dark:border-blue-500/30 text-slate-900 dark:text-blue-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                            percentage: "text-blue-600 dark:text-blue-400"
                          }
                        }[p.color as 'green' | 'teal' | 'blue'];

                        return (
                          <div key={p.name} className={cn("flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-slate-900/60 border border-border transition-all shadow-sm dark:shadow-inner", styles.container)}>
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs shadow-sm dark:shadow-lg", styles.badge)}>
                                {p.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{p.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.role}</span>
                              </div>
                            </div>
                            <div className={cn("text-xs font-bold font-mono tracking-wide", styles.percentage)}>{p.match}% MATCH</div>
                          </div>
                        );
                      })}

                      <div className="mt-4 p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
                         <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest leading-relaxed">
                           {genesisState === 'complete' ? "Oracle matrixing Team to stream signatures..." : "Oracle sync active. Heuristics aligned."}
                         </p>
                      </div>
                    </div>
                  ) : (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                      <UserCheck className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-xs text-muted-foreground text-center px-4 max-w-[200px]">Provide raw context to unlock predictive AI Team match scoring.</p>
                   </div>
                  )}
                </div>
             </div>
           )}

           {/* Genesis Workflow Canvas */}
           <AnimatePresence mode="wait">
             {(genesisState === 'approving' || genesisState === 'synthesizing' || genesisState === 'reviewed') && (
               <motion.div 
                 key={genesisState}
                 initial={{ opacity: 0, y: 30 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95 }}
                 className={cn(
                   "w-full pb-24 relative z-10 flex flex-col",
                   genesisState !== 'reviewed' && "mt-10 border-t border-border dark:border-white/5 pt-10"
                 )}
               >
                 {/* Phase 3: Stream Approval */}
                 {genesisState === 'approving' && (
                   <div className="w-full flex flex-col gap-6">
                     <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 whitespace-nowrap">
                            <Layers className="w-6 h-6 text-indigo-500 dark:text-indigo-400 shrink-0" />
                            Drafted Streams
                          </h2>
                          <p className="text-sm text-muted-foreground">Review the AI-generated streams before activating the project in Pulse.</p>
                        </div>
                        
                        <Button 
                          variant="primary"
                          onClick={handleApproveStreams}
                          className="px-8 py-3 text-sm tracking-widest gap-3"
                        >
                          APPROVE STREAMS
                          <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-slate-900/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                          </div>
                        </Button>
                     </div>
                     <StreamAccordion type="drafted" showDrops={false} />
                   </div>
                 )}

                 {/* Phase 4: Synthesis Simulation */}
                 {genesisState === 'synthesizing' && (
                   <div className="w-full py-20 flex flex-col items-center text-center">
                     <div className="relative w-20 h-20 mb-8">
                       <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-500 dark:border-t-cyan-400 animate-spin" />
                       <div className="flex items-center justify-center h-full">
                         <Network className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                       </div>
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 whitespace-nowrap">Synthesizing Backlog</h2>
                     <p className="text-muted-foreground mb-8 max-w-md">Oracle is generating individual Drops and levelling swimlanes based on approved stream structures.</p>
                     
                     <div className="w-full max-w-md">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">
                          <span>Progress</span>
                          <span className="text-cyan-600 dark:text-cyan-400">{synthesisProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${synthesisProgress}%` }}
                          />
                        </div>
                     </div>
                   </div>
                 )}

                 {/* Phase 5: Final Review (Synced with Wizard Layout) */}
                 {genesisState === 'reviewed' && (
                    <div className="w-full flex gap-10 items-start mt-4">
                     {/* Left: Final Backlog */}
                     <div className="flex-[2] flex flex-col gap-6">
                       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border dark:border-white/5 pb-6 mb-2">
                          <div className="flex flex-col gap-1">
                             <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight whitespace-nowrap">
                               <Rocket className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                               Final Backlog Ready
                             </h2>
                             <p className="text-sm text-muted-foreground font-light">The synthesis is complete. Review all Drops before launching the project.</p>
                          </div>

                          <Button 
                            variant="primary"
                            onClick={() => window.location.href = '/dashboard'}
                            className="px-8 py-3 text-sm tracking-widest gap-3"
                          >
                            SEND TO PULSE
                            <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-slate-900/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </Button>
                       </div>
                       
                       <StreamAccordion type="drafted" showDrops={true} />
                     </div>

                     {/* Right: Full Team Matrix (Detailed) */}
                     <div className="flex-1 bg-card dark:bg-slate-900/40 border border-border dark:border-slate-800/60 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-3 mb-8 border-b border-border dark:border-white/5 pb-6">
                          <UserPlus className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Full Team Matrix</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                          {([
                            { name: 'Sarah', role: 'Authentication', match: 98, color: 'green' },
                            { name: 'Mike', role: 'Database Arch', match: 92, color: 'teal' },
                            { name: 'Alex', role: 'UI / UX', match: 85, color: 'blue' }
                          ] as const).map((p) => {
                            const styles = {
                              green: {
                                container: "dark:shadow-green-900/10",
                                badge: "bg-white dark:bg-green-900/40 border-black/[0.03] dark:border-green-500/30 text-slate-900 dark:text-green-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                                percentage: "text-green-600 dark:text-green-400"
                              },
                              teal: {
                                container: "dark:shadow-teal-900/10",
                                badge: "bg-white dark:bg-teal-900/40 border-black/[0.03] dark:border-teal-500/30 text-slate-900 dark:text-teal-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                                percentage: "text-teal-600 dark:text-teal-400"
                              },
                              blue: {
                                container: "dark:shadow-blue-900/10",
                                badge: "bg-white dark:bg-blue-900/40 border-black/[0.03] dark:border-blue-500/30 text-slate-900 dark:text-blue-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                                percentage: "text-blue-600 dark:text-blue-400"
                              }
                            }[p.color];

                            return (
                              <div key={p.name} className={cn("flex items-center justify-between p-3 rounded-xl bg-muted/50 dark:bg-slate-900/60 border border-border dark:border-transparent transition-all shadow-sm dark:shadow-inner", styles.container)}>
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs shadow-sm dark:shadow-lg", styles.badge)}>
                                    {p.name.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 tracking-tight">{p.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.role}</span>
                                  </div>
                                </div>
                                <div className={cn("text-xs font-bold font-mono tracking-wide", styles.percentage)}>{p.match}% MATCH</div>
                              </div>
                            );
                          })}
                        </div>
                     </div>
                   </div>
                 )}
               </motion.div>
             )}
           </AnimatePresence>

        </motion.div>
       )}


    </div>
  );
}
