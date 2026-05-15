'use client';

import { Bot, Sparkles, AlertTriangle, Info, Send, ChevronLeft, ChevronRight, ChevronDown, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePersona, FeedItem } from '@/context/PersonaContext';
import { useGenesis } from '@/context/GenesisContext';

export function AgentPanel() {
  const { activePersona, isAgentOpen, setIsAgentOpen, feed: dynamicFeed, analysisMode } = usePersona();
  const { genesisState } = useGenesis();
  
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [isOracleThinking, setIsOracleThinking] = useState(false);
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);

  const isThinking = genesisState === 'scanning' || genesisState === 'uploading' || isOracleThinking;

  const handleToggle = () => {
    setIsAgentOpen(!isAgentOpen);
  };

  // Persona-specific context
  let briefing = '';
  let feed: FeedItem[] = [];
  let quickActions: string[] = [];

  switch (activePersona) {
    case 'Team Member':
      briefing = "Technical Lead mode engaged. I've reviewed your active drops. 2 specs need clarification.";
      feed = [
        { id: '1', type: 'update', text: 'Project Oracle updated your specs for Drop #8120.' },
        { id: '2', type: 'alert', text: 'Dependency blocker resolved on Database Consolidation.' }
      ];
      quickActions = ['Explain this Drop', 'Lookup Technical Spec', 'Record Rationale'];
      break;
    case 'Project Manager':
    default:
      briefing = "Flight Pilot mode engaged. 3 Drops require scheduling. Capacity is optimal.";
      feed = [
        { id: '1', type: 'alert', text: 'Dependency conflict detected in Drop #402. Re-leveling recommended.' },
        { id: '2', type: 'suggestion', text: 'Elena Gomez has spare capacity. Shift "API Documentation" to her flow?' }
      ];
      quickActions = ['Re-level Capacity', 'Analyze Risk', 'Schedule Sync'];
      break;
  }

  // Combine static persona feed with dynamic updates from the dashboard
  const combinedFeed = [...dynamicFeed, ...feed];

  return (
    <aside
      className={cn(
        "fixed right-0 top-16 bottom-0 z-[400] transition-all duration-500 ease-in-out flex flex-col",
        isAgentOpen 
          ? "w-[360px] bg-background/80 dark:bg-slate-900/40 backdrop-blur-xl border-l border-border dark:border-white/10 shadow-arctic dark:shadow-[-20px_0_50px_rgba(0,0,0,0.5)]" 
          : "w-0 border-none shadow-none"
      )}
    >
      <button
        onClick={handleToggle}
        className="absolute -left-10 bottom-6 w-10 h-12 bg-background/80 dark:bg-slate-900 border-y border-l border-border dark:border-cyan-500/30 rounded-l-xl flex items-center justify-center text-cyan-700 dark:text-cyan-400 hover:bg-muted dark:hover:bg-cyan-950 transition-colors z-50 group shadow-arctic dark:shadow-[-5px_0_20px_rgba(34,211,238,0.15)]"
      >
        {isAgentOpen ? (
          <motion.div animate={{ rotate: 0 }}>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-all" />
          </motion.div>
        ) : (
          <motion.div animate={{ rotate: 0 }}>
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-all" />
          </motion.div>
        )}
      </button>

      {isAgentOpen && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 animate-in fade-in duration-500 no-scrollbar">
          <div className="flex items-center gap-3 pb-4 border-b border-border dark:border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 relative overflow-hidden">
              {isThinking && (
                <div className="absolute inset-0 bg-indigo-400/20 animate-pulse" />
              )}
              <Bot className={cn("w-5 h-5 relative z-10", isThinking && "animate-bounce")} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-foreground">Oracle Insights</h2>
              <p className="text-xs text-muted-foreground">{isThinking ? "Recalculating Flow..." : "AI-CFM Assistant"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto shrink-0 pb-4">
            {/* Direct Briefing Section */}
            {briefing && (
              <div className="p-5 rounded-[24px] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-arctic dark:shadow-[0_0_20px_rgba(99,102,241,0.05)] relative overflow-hidden group/briefing">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/briefing:opacity-40 transition-opacity">
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Daily Briefing</span>
                  <div className="h-[1px] flex-1 bg-indigo-500/20" />
                </div>
                <p className="text-sm text-indigo-900 dark:text-indigo-100 leading-relaxed font-medium">
                  {briefing}
                </p>
              </div>
            )}

            {isThinking && (
              <div className="flex items-center gap-2 p-4 rounded-[20px] bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-500/20 shadow-arctic dark:shadow-inner dark:shadow-cyan-900/10">
                <div className="flex gap-1 h-3 ml-2 items-end pb-0.5">
                  <div className="w-1 bg-cyan-500 dark:bg-cyan-400 h-1 animate-[ping_1.5s_infinite_0s] rounded-full" />
                  <div className="w-1 bg-cyan-500 dark:bg-cyan-400 h-2 animate-[ping_1.5s_infinite_200ms] rounded-full" />
                  <div className="w-1 bg-cyan-500 dark:bg-cyan-400 h-3 animate-[ping_1.5s_infinite_400ms] rounded-full" />
                </div>
                <span className="text-xs text-cyan-600 dark:text-cyan-400/70 font-mono tracking-widest pl-3 uppercase">Analyzing Sync</span>
              </div>
            )}

            {combinedFeed.map(item => (
              <div
                key={item.id}
                className={cn(
                  "border rounded-[20px] p-4 flex gap-3 backdrop-blur-md animate-in slide-in-from-right-4 fade-in duration-300",
                  item.type === 'alert' && "bg-rose-50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30 shadow-arctic dark:shadow-inner dark:shadow-rose-900/10",
                  item.type === 'suggestion' && "bg-card dark:bg-slate-900/40 border-border dark:border-white/5 shadow-arctic dark:shadow-none",
                  item.type === 'update' && "bg-blue-50 dark:bg-cyan-950/10 border-blue-200 dark:border-cyan-900/30 shadow-arctic dark:shadow-inner dark:shadow-cyan-900/10"
                )}
              >
                {item.type === 'alert' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                {item.type === 'suggestion' && <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
                {item.type === 'update' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                <p className="text-sm text-foreground leading-relaxed font-light">
                  {item.text}
                </p>
              </div>
            ))}

            {activePersona === 'Team Member' && (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/10 shadow-lg dark:shadow-none">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI-Predicted Upcoming</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: '8210', title: 'Token Refresh Middleware', confidence: '94%', why: 'best next match when #1290 closes' },
                      { id: '8211', title: 'Auth Context Provider', confidence: '88%', why: 'Skill match: React Context & Security' },
                      { id: '8215', title: 'OAuth Redirect Flow', confidence: '82%', why: 'Logical successor to middleware' }
                    ].map(drop => (
                      <div key={drop.id} className="p-3 rounded-xl bg-muted border border-border hover:border-indigo-500/30 transition-all cursor-pointer group shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold">#{drop.id}</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{drop.confidence} Confidence</span>
                        </div>
                        <p className="text-sm text-foreground font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{drop.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 italic">&quot;{drop.why}&quot;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="mt-auto shrink-0 flex flex-col gap-3">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map(action => (
                <button
                  key={action}
                  className="px-3 py-1.5 rounded-full bg-card border border-border hover:border-cyan-500/50 hover:bg-muted dark:hover:bg-cyan-500/10 text-xs font-semibold text-foreground hover:text-cyan-600 dark:hover:text-cyan-400 transition-all text-left whitespace-nowrap shadow-sm dark:shadow-none"
                >
                  {action}
                </button>
              ))}
            </div>

            <div className={cn(
              "relative transition-all duration-500",
              analysisMode === 'timeline' && genesisState === 'idle' && "scale-[1.02]"
            )}>
              {analysisMode === 'timeline' && (
                <div className="absolute -top-10 left-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/50 animate-pulse">
                    Oracle Command Line
                  </span>
                </div>
              )}
              <input
                type="text"
                placeholder="Ask Oracle..."
                className={cn(
                  "w-full bg-card border rounded-[20px] py-4 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all font-mono shadow-xl dark:shadow-2xl",
                  analysisMode === 'timeline' 
                    ? "border-cyan-500/50 shadow-sm dark:shadow-[0_0_20px_rgba(34,211,238,0.1)] focus:border-cyan-400" 
                    : "border-border focus:border-cyan-500/50"
                )}
              />
              <button className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
                analysisMode === 'timeline' ? "text-cyan-400 hover:text-cyan-300" : "text-slate-500 hover:text-cyan-400"
              )}>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
