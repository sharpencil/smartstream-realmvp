'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Drop, DropState, getDropWidth } from './Drop';
import { DailyBriefing } from './DailyBriefing';
import { cn } from '@/lib/utils';
import { STAGING_DROPS, STAGING_STREAMS } from '@/lib/stagingData';
import { STREAM_COLORS, StreamColorKey, Reference, PALETTE_KEYS, getStreamColor } from '@/lib/streams';
import { Zap, PlayCircle, ChevronDown, AlertTriangle, Plus, Minus, Link, X, Crosshair, Search, Clock, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { format, addDays, startOfDay, addHours, differenceInDays, differenceInWeeks, isWeekend, startOfWeek } from 'date-fns';
import { mockEmployees } from '@/lib/mockTeam';
import { usePersona, FeedItem } from '@/context/PersonaContext';
import { useGenesis } from '@/context/GenesisContext';
import { BurndownOverlay } from './BurndownOverlay';
import * as Popover from '@radix-ui/react-popover';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';

export interface DropData {
  id: string;
  lane: number;
  title: string;
  state: DropState;
  effortHours: number;
  complexity?: number;
  description?: string;
  tasks?: string[];
  status?: string;
  xOffset: number;
  isBlocked?: boolean;
  references?: Reference[];
  streamId?: string;
  dependsOn?: string[];
  isReady?: boolean;
}



const DAY_WIDTH = 80;
const START_DATE = startOfDay(new Date());

// Helper to map xOffset to Date
function xToDate(x: number, nowX: number): Date {
  const daysFromNow = (x - nowX) / DAY_WIDTH;
  return addDays(new Date(), daysFromNow);
}

// ── TimeAxis Component ──────────────────────────────────────────────────────
function TimeAxis({ zoomScale, nowX, totalWidth, sidebarWidth, hoveredDrop, selectedDrop }: {
  zoomScale: number,
  nowX: number,
  totalWidth: number,
  sidebarWidth: number,
  hoveredDrop?: DropData | null,
  selectedDrop?: DropData | null
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dayWidth = DAY_WIDTH * zoomScale;

  // Transitions: Weeks (default) -> Days (zoomed)
  const weekOpacity = Math.max(0, Math.min(1, (0.85 - zoomScale) / 0.1));
  const dayOpacity = Math.max(0, Math.min(1, (zoomScale - 0.75) / 0.1));

  const layers = useMemo(() => {
    if (!mounted) return { weeks: [], days: [] };

    const startOfToday = START_DATE;

    // Dynamic range based on viewport
    const startDay = Math.floor(-nowX / DAY_WIDTH) - 10;
    const endDay = Math.ceil((totalWidth / zoomScale - nowX) / DAY_WIDTH) + 2;

    const res = { weeks: [] as any[], days: [] as any[] };

    // 1. Weeks
    if (weekOpacity > 0) {
      const PROJECT_START_X = 24;
      const WEEK_WIDTH = 7 * DAY_WIDTH;
      const canvasStart = (startDay - 7) * DAY_WIDTH + nowX;
      const canvasEnd = (endDay + 7) * DAY_WIDTH + nowX;

      const startW = Math.floor((canvasStart - PROJECT_START_X) / WEEK_WIDTH);
      const endW = Math.ceil((canvasEnd - PROJECT_START_X) / WEEK_WIDTH);

      for (let w = startW; w <= endW; w++) {
        if (w < 0) continue; // Don't show weeks before project start

        const isMacro = zoomScale < 0.35;
        const weekStep = zoomScale < 0.2 ? 4 : (isMacro ? 2 : 1);

        if (w % weekStep !== 0) continue;

        const xOffset = PROJECT_START_X + w * WEEK_WIDTH;
        const x = xOffset * zoomScale;

        res.weeks.push({ x, label: `WK ${w + 1}` });
      }
    }

    // 2. Days
    if (dayOpacity > 0) {
      // Adaptive day stepping: show every 2nd day if zoom is low
      const dayStep = zoomScale < 1.0 ? 2 : 1;
      for (let i = startDay; i < endDay; i++) {
        if (i % dayStep !== 0) continue;
        const date = addDays(startOfToday, i);
        const x = (i * DAY_WIDTH + nowX) * zoomScale;
        res.days.push({ x, label: format(date, 'EEE d') });
      }
    }

    return res;
  }, [mounted, zoomScale, nowX, totalWidth, weekOpacity, dayOpacity]);

  return (
    <div
      className="sticky top-[76px] z-[110] h-12 border-b border-border dark:border-white/5 bg-transparent pointer-events-none"
      style={{ minWidth: totalWidth + sidebarWidth, width: '100%' }}
      suppressHydrationWarning
    >
      <div className="relative h-full overflow-hidden" style={{ marginLeft: sidebarWidth }} suppressHydrationWarning>
        {/* Weeks */}
        <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: weekOpacity }}>
          {layers.weeks.map((item, i) => (
            <div key={i} className="absolute top-0 bottom-0 flex flex-col justify-end pb-2" style={{ left: item.x }}>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap pl-1.5 pb-0.5">{item.label}</span>
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: dayOpacity }}>
          {layers.days.map((item, i) => (
            <div key={i} className="absolute top-0 bottom-0 flex flex-col justify-end pb-2" style={{ left: item.x }}>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap px-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── GridLayer Component ─────────────────────────────────────────────────────
function GridLayer({ zoomScale, nowX, totalWidth, sidebarWidth }: {
  zoomScale: number,
  nowX: number,
  totalWidth: number,
  sidebarWidth: number
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dayWidth = DAY_WIDTH * zoomScale;
  const startOfToday = START_DATE;
  const startOfThisWeek = startOfWeek(startOfToday, { weekStartsOn: 1 });

  // Dynamic range based on viewport
  const startDay = Math.floor(-nowX / DAY_WIDTH) - 10;
  const endDay = Math.ceil((totalWidth / zoomScale - nowX) / DAY_WIDTH) + 2;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ marginLeft: sidebarWidth }} suppressHydrationWarning>
      {Array.from({ length: endDay - startDay + 20 }).map((_, i) => {
        const offset = startDay + i;
        const date = addDays(startOfToday, offset);
        const isLowZoom = zoomScale < 0.4;

        // Synchronize with TimeAxis step logic (Mondays)
        if (isLowZoom) {
          const dayOfThisWeek = differenceInDays(date, startOfWeek(date, { weekStartsOn: 1 }));
          if (dayOfThisWeek !== 0) return null;

          const weekOffset = differenceInWeeks(date, startOfThisWeek);
          const weekStep = zoomScale < 0.15 ? 4 : 2;
          if (Math.abs(weekOffset) % weekStep !== 0) return null;
        }

        const x = (offset * DAY_WIDTH + nowX) * zoomScale;
        const weekend = isWeekend(date);

        return (
          <React.Fragment key={offset}>
            {/* Vertical Rays (Grid Lines) */}
            {!weekend && (
              <div
                className="absolute top-0 bottom-0 w-[1px] bg-border opacity-5 dark:opacity-10"
                style={{ left: x }}
              />
            )}
            {/* Weekend Trench */}
            {weekend && (
              <div
                className="absolute top-0 bottom-0 bg-slate-100/30 dark:bg-black/20"
                style={{ left: x, width: dayWidth }}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#0ea5e9_1px,_transparent_1px)] bg-[size:12px_12px]" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}



// ── Staging stream definition map ────────────────────────────────────────────
const STAGING_STREAM_MAP = Object.fromEntries(
  STAGING_STREAMS.map((s, idx) => [
    s.id,
    {
      id: s.id,
      title: s.title,
      initials: s.initials,
      colorKey: PALETTE_KEYS[idx % PALETTE_KEYS.length]
    },
  ])
);

const PREDEFINED_NAMES = ['Sarah', 'Mike', 'Alex', 'Elena', 'Sam', 'David', 'Laura', 'Chris'];
const uniqueOwnerIds = Array.from(new Set(STAGING_DROPS.map(d => d.owner_id).filter(Boolean)));
export const TEAM_MEMBERS = uniqueOwnerIds.map((id, index) => ({
  id,
  name: PREDEFINED_NAMES[index % PREDEFINED_NAMES.length] || `Member ${index + 1}`
}));
if (TEAM_MEMBERS.length === 0) {
  TEAM_MEMBERS.push({ id: '1', name: 'Sarah' });
}


//  Completed   → left of NOW_LINE_BASE (pre-Now)
//  Not Started → ghost, right of NOW_LINE_BASE
//  In Progress → active, near NOW_LINE_BASE
let NOW_LINE_BASE = 420;

function buildInitialData(): { drops: DropData[], unassigned: DropData[] } {
  const dropsMap = new Map<string, DropData>();
  const unassigned: DropData[] = [];

  // Specific drops to move to the 'Reservoir' (Backlog)
  const BACKLOG_DROP_IDS = ['8999', '9000'];

  STAGING_STREAMS.forEach((stream) => {
    stream.drops.forEach((drop) => {
      let lane = 0;
      const tIdx = TEAM_MEMBERS.findIndex(m => m.id === drop.owner_id);
      if (tIdx > -1) lane = tIdx;

      let state: 'ghost' | 'active' | 'completed' = 'ghost';
      if (drop.status === 'Completed') state = 'completed';
      else if (drop.status === 'Active' || drop.status === 'In Progress') state = 'active';

      // Mark blocked / red trace if missing completion date and past due date
      const isBroken = Boolean(!drop.completion_date && drop.due_date && new Date() > new Date(drop.due_date));

      const dropId = `staging-${drop.drop_id}`;
      const dropData: DropData = {
        id: dropId,
        lane,
        title: drop.title,
        description: drop.title,
        tasks: drop.tasks,
        status: drop.status,
        complexity: drop.complexity || 4,
        state,
        effortHours: drop.estimated_time || drop.complexity || 4,
        xOffset: 0,
        streamId: stream.id,
        isBlocked: isBroken,
        dependsOn: (drop.dependsOn || []).map((d: string) => `staging-${d}`),
      };

      if (BACKLOG_DROP_IDS.includes(drop.drop_id)) {
        unassigned.push(dropData);
      } else {
        dropsMap.set(dropId, dropData);
      }
    });
  });

  const allDrops = Array.from(dropsMap.values());

  const getTopologicalOrder = (nodes: DropData[]): string[] => {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();
    nodes.forEach(d => {
      inDegree.set(d.id, 0);
      if (!graph.has(d.id)) graph.set(d.id, []);
    });

    // Reverse dependency graph (A depends on B -> B to A edge)
    nodes.forEach(d => {
      (d.dependsOn || []).forEach(depId => {
        if (graph.has(depId)) {
          graph.get(depId)!.push(d.id);
          inDegree.set(d.id, (inDegree.get(d.id) || 0) + 1);
        }
      });
    });

    const queue: string[] = [];
    inDegree.forEach((count, id) => { if (count === 0) queue.push(id); });

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);
      graph.get(u)!.forEach(v => {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) queue.push(v);
      });
    }

    nodes.forEach(d => { if (!order.includes(d.id)) order.push(d.id); });
    return order;
  };

  let INITIAL_MAX_X = 420;

  const order = getTopologicalOrder(allDrops);
  const laneEndTimes: Record<number, number> = {};

  order.forEach(id => {
    const d = dropsMap.get(id);
    if (!d) return;

    let baseStart = 400; // Large logical padding to ensure visibility behind sidebar shadow at max zoom-out

    if (d.dependsOn) {
      d.dependsOn.forEach(depId => {
        const p = dropsMap.get(depId);
        if (p) {
          const pEnd = p.xOffset + getDropWidth({ effortHours: p.effortHours, complexity: p.complexity }, 1) + 20;
          if (pEnd > baseStart) baseStart = pEnd;
        }
      });
    }

    const lEnd = laneEndTimes[d.lane] || 0;
    const actualStart = Math.max(baseStart, lEnd + 15);
    d.xOffset = actualStart;

    const nodeEnd = actualStart + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1);
    laneEndTimes[d.lane] = nodeEnd;

    if (nodeEnd > INITIAL_MAX_X) {
      INITIAL_MAX_X = nodeEnd;
    }
  });

  // Calculate NOW_LINE_BASE at 25% of the total project duration
  NOW_LINE_BASE = INITIAL_MAX_X * 0.25;

  let didAssignBlocker = false;

  // Adjust drop visualizations (states) based strictly on their physical relation to the 25% NOW mark
  allDrops.forEach(d => {
    const nodeRightEdge = d.xOffset + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1);
    const isOverlapping = d.xOffset < NOW_LINE_BASE + 20 && nodeRightEdge > NOW_LINE_BASE;

    if (isOverlapping && !didAssignBlocker) {
      d.isBlocked = true;
      didAssignBlocker = true;
    }

    if (d.isBlocked) {
      d.state = 'active';
      d.isReady = false;
    } else if (nodeRightEdge <= NOW_LINE_BASE + 20) {
      d.state = 'completed';
      d.isReady = false;
    } else if (isOverlapping) {
      d.state = 'active';
      d.isReady = false;
    } else {
      d.state = 'ghost';

      // Calculate `isReady` visually if child is pending but parent is completed
      let parentCompleted = false;
      if (d.dependsOn) {
        d.dependsOn.forEach(depId => {
          const p = dropsMap.get(depId);
          if (p && p.state === 'completed') parentCompleted = true;
        });
      }
      if (parentCompleted) d.isReady = true;
    }
  });
  return { drops: allDrops, unassigned };
}

const { drops: INITIAL_DROPS, unassigned: INITIAL_UNASSIGNED_DROPS } = buildInitialData();

const RAW_MIN_X = Math.min(...INITIAL_DROPS.map(d => d.xOffset));
const X_SHIFT = -RAW_MIN_X + 24;
INITIAL_DROPS.forEach(d => { d.xOffset += X_SHIFT; });

const PROJECT_END_X = Math.max(...INITIAL_DROPS.map(d => d.xOffset + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1))) + 100;

const INITIAL_ZOOM = Math.min(1, 1400 / Math.max(PROJECT_END_X, 100));

// ── Seed velocity from estimated vs. completion time ─────────────────────────
function buildInitialVelocity(initialDrops: DropData[]): Record<string, number> {
  const result: Record<string, number> = {};

  // Calculate average delta for each lane's completed drops
  for (let lane = 0; lane < 4; lane++) {
    const laneId = (lane + 1).toString();
    const laneDrops = initialDrops.filter(d => d.lane === lane && d.state === 'completed');

    // We need the original StagingDrop data to get completion_time/estimated_time
    // But we can approximate it or map it back.
    // Better: compute from STAGING_DROPS filtered by the same logic
    const originalDrops = STAGING_DROPS.filter((_, idx) => (idx % 4) === lane && _.status === 'Completed');

    if (originalDrops.length > 0) {
      const totalDelta = originalDrops.reduce((acc, d) => acc + (d.estimated_time - d.completion_time), 0);
      result[laneId] = Math.round((totalDelta / originalDrops.length) * 10);
    } else {
      result[laneId] = 0;
    }

    // Force negative for visual variety on Alex (Lane 3)
    if (laneId === '3') result[laneId] = -14;
  }

  // Clamp to realistic values
  Object.keys(result).forEach((k) => {
    result[k] = Math.max(-25, Math.min(25, result[k]));
  });
  return result;
}

const INITIAL_VELOCITY: Record<string, number> = buildInitialVelocity(INITIAL_DROPS);

const NOW_LINE_X = NOW_LINE_BASE + X_SHIFT;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the right edge x (canvas space) of a drop */
function dropRightEdge(drop: DropData, zoomScale: number) {
  const width = getDropWidth(drop, zoomScale);
  return (drop.xOffset * zoomScale) + width;
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Decision {
  id: string;
  dropId: string;
  fromMemberId: string;
  toMemberId: string;
  impact: string;
  type: 'reassign';
}

const INITIAL_DECISIONS: Decision[] = [
  { id: 'dec-1', dropId: 'staging-8120', fromMemberId: '3', toMemberId: '1', impact: '-4.0h slip', type: 'reassign' }
];

const MOCK_FIRM_PROJECTS = [
  { id: 'phoenix', name: 'Project Phoenix' },
  { id: 'oracle', name: 'Project Oracle' }
];

export function PulseDashboard() {
  const router = useRouter();
  const { isDeepDive, setIsDeepDive, setActivePersona, setFeed, selectedProjectId, activePersona, analysisMode, setAnalysisMode } = usePersona();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return MOCK_FIRM_PROJECTS.find(p => p.id === selectedProjectId);
  }, [selectedProjectId]);
  const { setGenesisState } = useGenesis();
  const [viewLevel, setViewLevel] = useState<'streams' | 'team'>('streams');
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null);
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);
  const [expandedStreamIds, setExpandedStreamIds] = useState<Set<string>>(new Set());
  const [expandedMemberIds, setExpandedMemberIds] = useState<Set<string>>(new Set());
  const [isBurndownOpen, setIsBurndownOpen] = useState(false);

  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Sidebar widths to ensure Now Line aligns in both views
  const SIDEBAR_DETAILED = 320; // Matches Team View's w-80 sidebar
  const SIDEBAR_OVERVIEW = 300;
  const SIDEBAR_FOCUS = 360;
  const currentSidebarWidth = viewLevel === 'team' ? SIDEBAR_DETAILED : (focusedStreamId ? SIDEBAR_FOCUS : SIDEBAR_OVERVIEW);

  const [drops, setDrops] = useState<DropData[]>(INITIAL_DROPS);
  const [unassignedDrops, setUnassignedDrops] = useState<DropData[]>(INITIAL_UNASSIGNED_DROPS);

  const [highlightHotLanes, setHighlightHotLanes] = useState(false);

  const [zoomScale, setZoomScale] = useState(INITIAL_ZOOM);
  const [minZoom, setMinZoom] = useState(0.05);
  const [isNowLineHovered, setIsNowLineHovered] = useState(false);
  const initialZoomDone = useRef(false);

  // Initial zoom calculation to fit the whole timeline in the available real estate
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        // Calculate available width: container width minus the sidebar and a safety margin
        const containerWidth = scrollContainerRef.current.clientWidth - currentSidebarWidth - 120;
        if (containerWidth > 0 && PROJECT_END_X > 0) {
          const fitZoom = containerWidth / PROJECT_END_X;
          const finalZoom = Math.min(1.2, Math.max(0.05, fitZoom));
          setMinZoom(finalZoom);
          if (!initialZoomDone.current) {
            setZoomScale(finalZoom);
            initialZoomDone.current = true;
          } else {
            setZoomScale(prev => Math.max(prev, finalZoom));
          }
        }
      }
    }, 150); // Delay to ensure layout and AgentPanel state are settled
    return () => clearTimeout(timer);
  }, [currentSidebarWidth]);

  // Auto-scroll to keep the NOW line centered when zooming
  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const targetScrollLeft = (NOW_LINE_X * zoomScale) + currentSidebarWidth - (containerWidth / 2);
      scrollContainerRef.current.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
    }
  }, [zoomScale, currentSidebarWidth]);

  const toggleStreamExpand = (id: string) => {
    if (viewLevel === 'streams') {
      setFocusedStreamId(prev => prev === id ? null : id);
      // Automatically expand if focusing
      setExpandedStreamIds(prev => {
        const next = new Set(prev);
        if (focusedStreamId === id) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }

    setExpandedStreamIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };



  const toggleMemberExpand = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setFocusedMemberId(null);
      } else {
        // Isolation logic: only focus if we are in team view
        if (viewLevel === 'team') {
          setFocusedMemberId(id);
        }
        next.add(id);
      }
      return next;
    });
  }, [viewLevel]);

  // Compute Critical Path Drops recursively
  const criticalPathDropIds = useMemo(() => {
    const dropEnds = drops.map(d => ({ id: d.id, end: d.xOffset + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1) }));
    if (dropEnds.length === 0) return new Set<string>();
    const latestDrop = dropEnds.reduce((max, d) => (d.end > max.end ? d : max), dropEnds[0]);

    const paths = new Set<string>();
    const stack = [latestDrop.id];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (!paths.has(currentId)) {
        paths.add(currentId);
        const currentDrop = drops.find(d => d.id === currentId);
        if (currentDrop && currentDrop.dependsOn) {
          // Track staging and non-staging formats
          const dependencies = currentDrop.dependsOn
            .map(did => drops.find(d => d.id === did || d.id === `staging-${did}`)?.id)
            .filter(Boolean) as string[];
          stack.push(...dependencies);
        }
      }
    }
    return paths;
  }, [drops]);


  const [hoveredStreamId, setHoveredStreamId] = useState<string | null>(null);
  const [hoveredDropId, setHoveredDropId] = useState<string | null>(null);

  const handleHoverDrop = useCallback((id: string | null) => {
    setHoveredDropId(id);
  }, []);

  const handleHoverStream = useCallback((id: string | null) => {
    setHoveredStreamId(id);
  }, []);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const [selectedStreamDependencyId, setSelectedStreamDependencyId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});

  const dropDependencyLinks = useMemo(() => {
    const linksToDraw: { src: DropData, dst: DropData }[] = [];
    const added = new Set<string>();
    const focusedMemberLaneIndex = focusedMemberId ? TEAM_MEMBERS.findIndex(m => m.id === focusedMemberId) : -1;

    drops.forEach(drop => {
      if (drop.dependsOn) {
        drop.dependsOn.forEach(depId => {
          const parent = drops.find(d => d.id === depId || d.id === `staging-${depId}`);
          if (parent) {
            if (parent.streamId !== drop.streamId) return;

            if (focusedStreamId && (drop.streamId !== focusedStreamId && parent.streamId !== focusedStreamId)) {
              return;
            }
            if (focusedMemberLaneIndex !== -1 && (drop.lane !== focusedMemberLaneIndex && parent.lane !== focusedMemberLaneIndex)) {
              return;
            }

            // Only draw if at least one end is selected
            if (drop.id === selectedDropId || parent.id === selectedDropId) {
              const key = `${parent.id}-${drop.id}`;
              const bothRendered = nodePositions[`drop-${parent.id}`] !== undefined && nodePositions[`drop-${drop.id}`] !== undefined;

              if (!added.has(key) && bothRendered) {
                added.add(key);
                linksToDraw.push({ src: parent, dst: drop });
              }
            }
          }
        });
      }
    });
    return linksToDraw;
  }, [drops, focusedStreamId, focusedMemberId, selectedDropId, nodePositions]);

  useEffect(() => {
    const updatePositions = () => {
      const svgEl = document.getElementById('svg-overlay-container');
      if (!svgEl) return;
      const svgRect = svgEl.getBoundingClientRect();
      const newPositions: Record<string, { x: number, y: number }> = {};

      document.querySelectorAll('[data-stream-id]').forEach(el => {
        const id = el.getAttribute('data-stream-id')!;
        const rect = el.getBoundingClientRect();
        newPositions[`stream-${id}`] = {
          x: (rect.left - svgRect.left) + (rect.width / 2),
          y: (rect.top - svgRect.top) + (rect.height / 2)
        };
      });

      document.querySelectorAll('[data-id]').forEach(el => {
        const id = el.getAttribute('data-id')!;
        const rect = el.getBoundingClientRect();
        newPositions[`drop-${id}`] = {
          x: (rect.left - svgRect.left) + (rect.width / 2),
          y: (rect.top - svgRect.top) + (rect.height / 2)
        };
      });

      setNodePositions(prev => {
        const keys = Object.keys(newPositions);
        if (keys.length !== Object.keys(prev).length) return newPositions;
        for (const k of keys) {
          if (Math.abs(newPositions[k].x - prev[k].x) > 1 || Math.abs(newPositions[k].y - prev[k].y) > 1) return newPositions;
        }
        return prev; // unchanged
      });
    };

    // Delay slight processing for layout animations to settle
    const to1 = setTimeout(updatePositions, 50);
    const to2 = setTimeout(updatePositions, 500);
    return () => { clearTimeout(to1); clearTimeout(to2); };
  }, [
    viewLevel,
    expandedStreamIds,
    drops,
    hoveredDropId,
    selectedDropId,
    selectedStreamDependencyId,
    focusedMemberId,
    focusedStreamId
  ]);

  // Briefing dismissal state (independent of data — PM can snooze)
  const [blockerDismissed, setBlockerDismissed] = useState(false);
  const [forecastDismissed, setForecastDismissed] = useState(false);
  const [resolutionDismissed, setResolutionDismissed] = useState(false);
  const [forecastSlipHours, setForecastSlipHours] = useState(4);


  const [memberVelocity, setMemberVelocity] = useState<Record<string, number>>(INITIAL_VELOCITY);



  // ── Derived Briefing State ───────────────────────────────────────────────

  const blockerCount = useMemo(() => drops.filter(d => d.isBlocked).length, [drops]);

  const streamStats = useMemo(() => {
    return STAGING_STREAMS.map(s => {
      const sDrops = drops.filter(d => d.streamId === s.id);
      const completed = sDrops.filter(d => d.state === 'completed').length;
      const total = sDrops.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const hasBlocker = sDrops.some(d => d.isBlocked);
      const contributors = Array.from(new Set(sDrops.map(d => d.lane)));
      return { id: s.id, percent, hasBlocker, contributors, drops: sDrops };
    });
  }, [drops]);



  // Find stream dependencies if a stream link is triggered
  const activeStreamDependencyPaths = useMemo(() => {
    if (!selectedStreamDependencyId) return [];
    const paths: { srcStreamId: string, dstStreamId: string, isParent: boolean }[] = [];

    const baseDrops = drops.filter(d => d.streamId === selectedStreamDependencyId);
    baseDrops.forEach(baseDrop => {
      // Upstream (Parents)
      if (baseDrop.dependsOn) {
        baseDrop.dependsOn.forEach(depId => {
          const parentDrop = drops.find(d => d.id === depId || d.id === `staging-${depId}`);
          if (parentDrop && parentDrop.streamId && parentDrop.streamId !== selectedStreamDependencyId) {
            paths.push({ srcStreamId: parentDrop.streamId, dstStreamId: selectedStreamDependencyId, isParent: true });
          }
        });
      }
      // Downstream (Children)
      const children = drops.filter(d => d.dependsOn?.includes(baseDrop.id) || d.dependsOn?.includes(baseDrop.id.replace('staging-', '')));
      children.forEach(childDrop => {
        if (childDrop.streamId && childDrop.streamId !== selectedStreamDependencyId) {
          paths.push({ srcStreamId: selectedStreamDependencyId, dstStreamId: childDrop.streamId, isParent: false });
        }
      });
    });

    // Dedup
    const unique = new Set<string>();
    return paths.filter(p => {
      const key = `${p.srcStreamId}-${p.dstStreamId}`;
      if (unique.has(key)) return false;
      unique.add(key);
      return true;
    });
  }, [selectedStreamDependencyId, drops]);

  // ── Drop Actions ────────────────────────────────────────────────────────

  const handleDropAction = (id: string, action: 'complete' | 'block' | 'in-progress' | 'ghost' | 'remove', rationale?: string) => {
    setGenesisState('scanning');

    setTimeout(() => {
      setDrops(prev => {
        const targetDropIdx = prev.findIndex(d => d.id === id);
        if (targetDropIdx === -1) return prev;

        const target = prev[targetDropIdx];
        const lane = target.lane;
        const shiftsLeft = action === 'complete' || action === 'remove';
        const shiftsRight = action === 'block';
        const unblocks = (action === 'in-progress' || action === 'ghost') && target.isBlocked;

        const SHIFT_AMOUNT = 80;
        let newDrops = [...prev];

        if (action === 'remove') {
          newDrops = newDrops.filter(d => d.id !== id);
        } else {
          let newState = target.state;
          if (action === 'complete') newState = 'completed';
          if (action === 'in-progress') newState = 'active';
          if (action === 'ghost') newState = 'ghost';

          newDrops[targetDropIdx] = {
            ...target,
            state: newState,
            isBlocked: action === 'block',
            xOffset: shiftsLeft ? target.xOffset - 20 : target.xOffset,
          };
        }

        if (action === 'complete') {
          setMemberVelocity(mPrev => ({ ...mPrev, [(lane + 1).toString()]: (mPrev[(lane + 1).toString()] || 0) + 2 }));
        } else if (action === 'block') {
          setMemberVelocity(mPrev => ({ ...mPrev, [(lane + 1).toString()]: (mPrev[(lane + 1).toString()] || 0) - 3 }));
        }

        const processShift = (dropId: string, shiftVal: number) => {
          const children = newDrops.filter(d => d.dependsOn?.includes(dropId));
          children.forEach(c => {
            const cIdx = newDrops.findIndex(x => x.id === c.id);
            if (cIdx > -1) {
              newDrops[cIdx] = { ...newDrops[cIdx], xOffset: newDrops[cIdx].xOffset + shiftVal };
              processShift(c.id, shiftVal);
            }
          });
        };

        if (shiftsLeft || shiftsRight || unblocks) {
          let offsetShift = 0;
          if (shiftsLeft) offsetShift = -SHIFT_AMOUNT;
          if (shiftsRight) offsetShift = SHIFT_AMOUNT;
          if (unblocks) offsetShift = -SHIFT_AMOUNT;

          for (let i = 0; i < newDrops.length; i++) {
            if (newDrops[i].id !== id && newDrops[i].lane === lane && newDrops[i].xOffset > target.xOffset) {
              newDrops[i] = { ...newDrops[i], xOffset: newDrops[i].xOffset + offsetShift };
            }
          }
          processShift(id, offsetShift);
        }

        return newDrops;
      });

      // Oracle feed
      const feedMessages: Record<string, FeedItem> = {
        remove: { id: Date.now().toString(), type: 'update', text: <span><span className="text-blue-600 dark:text-blue-400 font-medium">Flow Re-leveled:</span> Drop removed. Timeline pulled forward.</span> },
        complete: { id: Date.now().toString(), type: 'update', text: <span><span className="text-blue-600 dark:text-blue-400 font-medium">Flow Re-leveled:</span> Drop completed early. Velocity registered.</span> },
        block: { id: Date.now().toString(), type: 'alert', text: <span><span className="text-rose-600 dark:text-rose-400 font-medium">Ripple Alert:</span> Drop blocked{rationale ? ` — "${rationale}"` : ''}. Dependency shifted.</span> },
        ghost: { id: Date.now().toString(), type: 'suggestion', text: <span><span className="text-indigo-600 dark:text-indigo-400 font-medium">Reverted:</span> Drop rescheduled to Ghost projection.</span> },
        'in-progress': { id: Date.now().toString(), type: 'suggestion', text: <span><span className="text-indigo-600 dark:text-indigo-400 font-medium">Resumed:</span> Drop set back to In Progress.</span> },
      };
      const msg = feedMessages[action];
      if (msg) setFeed(prev => [msg, ...prev]);

      setGenesisState('idle');
    }, 1200);
  };

  const handleDragEnd = (id: string, clientX: number, clientY: number) => {
    setGenesisState('scanning');
    // Find drop target by temporarily hiding the dragged element?
    // Actually, simple approximation: lane Y starts at ~230. Each lane is ~100px.
    setTimeout(() => {
      const laneIdx = Math.max(0, Math.min(4, Math.floor((clientY - 230) / 100)));
      let newXOffset = Math.max(0, (clientX - 320) / zoomScale); // 320 for sidebar offset

      setDrops(prev => {
        let newDrops = [...prev];
        const existingIdx = prev.findIndex(d => d.id === id);
        let shiftVal = 0;

        if (existingIdx > -1) {
          shiftVal = newXOffset - prev[existingIdx].xOffset;
          newDrops[existingIdx] = { ...prev[existingIdx], lane: laneIdx, xOffset: newXOffset };
        } else {
          const backlog = unassignedDrops.find(d => d.id === id);
          if (backlog) {
            setUnassignedDrops(u => u.filter(d => d.id !== id));
            const clampedX = Math.max(NOW_LINE_X, newXOffset);
            shiftVal = 0; // initial drop
            newDrops.push({ ...backlog, lane: laneIdx, xOffset: clampedX });
          }
        }

        const shiftChildren = (parentId: string, amount: number) => {
          if (amount === 0) return;
          const children = newDrops.filter(d => d.dependsOn?.includes(parentId));
          children.forEach(c => {
            const cIdx = newDrops.findIndex(x => x.id === c.id);
            if (cIdx > -1) {
              newDrops[cIdx] = { ...newDrops[cIdx], xOffset: newDrops[cIdx].xOffset + amount };
              shiftChildren(c.id, amount);
            }
          });
        };

        shiftChildren(id, shiftVal);
        return newDrops;
      });

      setFeed(prev => [
        { id: Date.now().toString(), type: 'update', text: <span><span className="text-blue-600 dark:text-blue-400 font-medium">Flow Recalculated:</span> Resources re-allocated. Forecast updated.</span> },
        ...prev
      ]);
      setForecastSlipHours(prev => Math.max(0, prev - 2)); // Ripple recovery
      setGenesisState('idle');
    }, 800);
  };


  const handleApproveDecision = (decision: Decision) => {
    setDecisions(prev => prev.filter(d => d.id !== decision.id));
    setDrops(prev => prev.map(drop => {
      if (drop.id === decision.dropId) {
        return { ...drop, lane: TEAM_MEMBERS.findIndex(m => m.id === decision.toMemberId) };
      }
      return drop;
    }));
    setFeed(prev => [{
      id: Date.now().toString(),
      type: 'update',
      text: <span><span className="text-blue-600 dark:text-blue-400 font-medium">Decision Executed:</span> Reassigned DROP-8120 to {TEAM_MEMBERS.find(m => m.id === decision.toMemberId)?.name}.</span>
    }, ...prev]);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <div className={cn("w-full flex flex-col text-slate-900 dark:text-slate-50 pb-32 bg-transparent")}>

        {/* Header Controls */}
        <div className={cn(
          "flex items-center justify-between px-8 pt-8 pb-5 dark:border-b dark:border-white/5 z-40 relative bg-background/80 dark:bg-slate-950/95"
        )}>
          <div className="flex flex-col">
            {isDeepDive && (
              <button
                onClick={() => {
                  setIsDeepDive(false);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider mb-4 transition-colors w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Firm Pulse
              </button>
            )}
            <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
              {isDeepDive && currentProject ? currentProject.name : "Pulse"}
            </h1>
          </div>
        </div>

        {/* ── Main Scroll Context (Vertical) ── */}
        <div className="flex flex-col px-8">
          {/* Daily Briefing (Scrollable) */}
          <div>
            <DailyBriefing
              blockerCount={blockerDismissed ? 0 : blockerCount}
              forecastSlipHours={forecastDismissed ? 0 : forecastSlipHours}
              forecastSlipStream="Identity & Auth Hub"
              onDismissBlocker={() => setBlockerDismissed(true)}
              onDismissForecast={() => setForecastDismissed(true)}
              blockerResolutionCount={resolutionDismissed ? 0 : blockerCount}
              onDismissResolution={() => setResolutionDismissed(true)}
              onBurndownClick={() => setIsBurndownOpen(true)}
              onCapacityClick={() => {
                setViewLevel('team');
                setFocusedStreamId(null);

                setHoveredStreamId(null);
                setHoveredDropId(null);
                setHighlightHotLanes(true);
              }}
              onClickBlocker={() => {
                // Scroll to first blocked drop (future: auto-scroll)
                setHoveredStreamId(null);
              }}
            />
          </div>

          {/* Timeline Section */}
          <div className={cn(
            "flex flex-col relative min-h-0 w-full flex-none"
          )}>
            {/* Scrollable Flow Area (Horizontal) */}
            <div
              ref={scrollContainerRef}
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedDropId(null);
              }}
              className={cn(
                'flex flex-col pt-0 pb-32 relative min-w-0',
                'flex-none overflow-x-auto custom-scrollbar'
              )}>

              {/* Invisible Scroll Width Spacer */}
              <div style={{ minWidth: (PROJECT_END_X * zoomScale) + currentSidebarWidth, height: 1 }} className="shrink-0 pointer-events-none" />

              {/* Top toolbar (Sticky within the vertical scroll container) */}
              <div className={cn(
                "left-0 right-0 z-[80] flex items-center justify-between pointer-events-none bg-transparent dark:bg-slate-950/40 py-5 px-8 rounded-b-2xl",
                "sticky top-0"
              )}>

                {/* Left: Spacer for center alignment */}
                <div className="flex-1" />

                {/* Center: View Level Tabs */}
                <div className="flex justify-center items-center pointer-events-auto">
                  <div className="flex bg-slate-100/80 dark:bg-slate-900/60 rounded-full p-1 border border-black/[0.03] dark:border-slate-800/60 relative h-auto">
                    {[
                      { id: 'streams', label: 'Streams' },
                      { id: 'team', label: 'Team' }
                    ].map((tab) => {
                      const isActive = viewLevel === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            if (tab.id === 'streams') setViewLevel('streams');
                            else if (tab.id === 'team') {
                              setViewLevel('team');
                              setHoveredStreamId(null);
                              setHoveredDropId(null);
                              setHighlightHotLanes(false);
                            }
                          }}
                          className={cn(
                            'relative px-6 py-2 rounded-full text-sm tracking-wide transition-colors outline-none whitespace-nowrap z-10',
                            isActive
                              ? 'text-slate-900 dark:text-teal-400 font-medium'
                              : 'text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground group'
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeTabPebble"
                              className="absolute inset-0 bg-white dark:bg-teal-950/80 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-none border-none dark:border dark:border-teal-500/20"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-20 uppercase font-bold text-[11px] tracking-widest">{tab.label}</span>

                          {/* Hover Indicator (Teal Dot) */}
                          {!isActive && (
                            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Zoom Controls */}
                <div className="flex-1 flex justify-end items-center pointer-events-auto">
                  <div className="inline-flex items-center bg-background rounded-xl p-1 h-10 border border-border dark:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <button
                      onClick={() => setZoomScale(prev => Math.max(minZoom, prev - 0.1))}
                      className="w-8 h-full flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30"
                      disabled={zoomScale <= minZoom}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="px-3 flex items-center">
                      <input
                        type="range"
                        min={minZoom}
                        max={2}
                        step={0.01}
                        value={zoomScale}
                        onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                        className="w-32 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-teal-500
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500
                                    [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(20,184,166,0.8)]
                                    hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
                      />
                    </div>

                    <button
                      onClick={() => setZoomScale(prev => Math.min(2, prev + 0.1))}
                      className="w-8 h-full flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              <AnimatePresence>
                {analysisMode === 'timeline' && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="contents"
                  >
                    <TimeAxis
                      zoomScale={zoomScale}
                      nowX={NOW_LINE_X}
                      totalWidth={PROJECT_END_X * zoomScale}
                      sidebarWidth={currentSidebarWidth}
                      hoveredDrop={hoveredDropId ? drops.find(d => d.id === hoveredDropId) : null}
                      selectedDrop={selectedDropId ? drops.find(d => d.id === selectedDropId) : null}
                    />

                    {/* Task 2: AI-Powered Decisions Waiting */}
                    {viewLevel === 'team' && (
                      <div className="absolute top-[60px] z-[130] flex gap-4 px-8 pointer-events-none" style={{ left: currentSidebarWidth }}>
                        <AnimatePresence>
                          {decisions.map(decision => {
                            const drop = drops.find(d => d.id === decision.dropId);
                            if (!drop) return null;
                            const fromMember = TEAM_MEMBERS.find(m => m.id === decision.fromMemberId);
                            const toMember = TEAM_MEMBERS.find(m => m.id === decision.toMemberId);

                            return (
                              <motion.div
                                key={decision.id}
                                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                className="pointer-events-auto bg-card border border-indigo-500/25 dark:border-indigo-500/40 rounded-2xl p-3 dark:shadow-[0_0_40px_rgba(99,102,241,0.12)] flex items-center gap-4 group min-w-[450px] shadow-lg"
                              >
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-950/50 flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30 shrink-0">
                                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-0.5">Oracle Suggestion</span>
                                  <span className="text-xs text-foreground font-bold whitespace-nowrap">
                                    Move <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{drop.id.toUpperCase()}</span> from {fromMember?.name} to {toMember?.name}
                                  </span>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide mt-0.5">Impact: {decision.impact}</span>
                                </div>
                                <div className="flex gap-1.5 ml-2">
                                  <Button
                                    variant="primary"
                                    onClick={() => handleApproveDecision(decision)}
                                    className="px-3 py-1 text-[10px]"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="px-3 py-1 text-[10px]"
                                  >
                                    Modify
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}



                    {/* Now Line Distance Gauge (Hover-based) */}
                    <AnimatePresence>
                      {isNowLineHovered && selectedDropId && (drops.find(d => d.id === selectedDropId)?.xOffset || 0) > NOW_LINE_BASE && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute top-[135px] pointer-events-none z-[120] flex items-center gap-2 bg-teal-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest dark:shadow-[0_0_20px_rgba(20,184,166,0.4)]"
                          style={{ left: (NOW_LINE_X * zoomScale) + currentSidebarWidth + 10 }}
                        >
                          <Clock className="w-3 h-3" />
                          T-minus {Math.max(1, Math.round((drops.find(d => d.id === selectedDropId)!.xOffset - NOW_LINE_BASE) / DAY_WIDTH))} days
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Now Line */}
                    <div
                      className="absolute top-[120px] bottom-0 w-[2px] bg-gradient-to-b from-teal-400/0 via-teal-400 to-teal-400/0 z-[120]
                       animate-time-pulse pointer-events-none
                       before:absolute before:content-[''] before:left-1/2 before:-translate-x-1/2 before:-top-3
                       before:w-3.5 before:h-3.5 before:bg-teal-400 before:rounded-full before:shadow-[0_0_10px_rgba(20,184,166,1)]
                       before:hover:scale-125 before:transition-transform before:pointer-events-auto before:cursor-pointer
                       after:content-['NOW'] after:absolute after:-top-8 after:left-1/2 after:-translate-x-1/2
                       after:bg-transparent after:text-teal-400
                       after:text-[10px] after:font-bold after:tracking-widest
                       transition-all duration-500"
                      style={{ left: (NOW_LINE_X * zoomScale) + currentSidebarWidth }}
                      onMouseEnter={() => setIsNowLineHovered(true)}
                      onMouseLeave={() => setIsNowLineHovered(false)}
                    >
                    </div>

                    {/* Swimlanes container */}
                    <div className="flex flex-col gap-0 mt-6 relative">
                      <GridLayer
                        zoomScale={zoomScale}
                        nowX={NOW_LINE_X}
                        totalWidth={PROJECT_END_X * zoomScale}
                        sidebarWidth={currentSidebarWidth}
                      />


                      {/* Dependency Traces SVG Layer - Elevated above popups with additive blending in dark mode */}
                      <svg id="svg-overlay-container" className="absolute inset-0 w-full h-full pointer-events-none z-[1500] overflow-visible" style={{ mixBlendMode: isDark ? 'plus-lighter' : 'normal' }}>
                        <defs>
                          <filter id="underwater-blur">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <AnimatePresence>
                          {/* 1. Stream Dependency Arcs */}
                          {activeStreamDependencyPaths.map(path => {
                            const srcPos = nodePositions[`stream-${path.srcStreamId}`];
                            const dstPos = nodePositions[`stream-${path.dstStreamId}`];
                            if (!srcPos || !dstPos) return null;

                            const targetStreamDef = STAGING_STREAM_MAP[path.srcStreamId];
                            const traceColor = targetStreamDef ? getStreamColor(targetStreamDef.colorKey).hex : '#94a3b8';

                            const startX = currentSidebarWidth - 20;
                            const midX = startX + 50;
                            const dPath = `M ${startX} ${srcPos.y} C ${midX} ${srcPos.y}, ${midX} ${dstPos.y}, ${startX} ${dstPos.y}`;

                            return (
                              <motion.path
                                key={`stream-${path.srcStreamId}-${path.dstStreamId}`}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.8 }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                d={dPath}
                                fill="none"
                                stroke={traceColor}
                                strokeWidth="3"
                                style={{ filter: isDark ? `drop-shadow(0 0 5px ${traceColor}80)` : 'none' }}
                              />
                            );
                          })}

                          {/* 2. Drop Dependency Traces */}
                          {dropDependencyLinks.map(({ src, dst }) => {
                            const getCenter = (d: DropData) => {

                              const storedPos = nodePositions[`drop-${d.id}`];

                              if (storedPos) {
                                return { x: storedPos.x, y: storedPos.y };
                              }

                              // Fallback (should be rare with visibility filtering)
                              const width = getDropWidth(d, zoomScale);
                              const y = (d.lane * 100) + 50;
                              return {
                                x: currentSidebarWidth + (d.xOffset * zoomScale) + width / 2,
                                y
                              };
                            };

                            const p1 = getCenter(src);
                            const p2 = getCenter(dst);

                            const isSimulating = false;
                            const isBroken = dst.isBlocked;

                            const targetStreamDef = STAGING_STREAM_MAP[dst.streamId || ''];
                            const traceColor = isSimulating ? '#f59e0b' : (isBroken ? '#f43f5e' : (targetStreamDef ? getStreamColor(targetStreamDef.colorKey).hex : '#94a3b8'));

                            const dPath = `M ${p1.x} ${p1.y} C ${p1.x + 100} ${p1.y}, ${p2.x - 100} ${p2.y}, ${p2.x} ${p2.y}`;

                            return (
                              <motion.path
                                key={`drop-${src.id}-${dst.id}`}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                  pathLength: 1,
                                  opacity: (hoveredDropId === src.id || hoveredDropId === dst.id || selectedDropId === src.id || selectedDropId === dst.id) ? 1 : 0.6,
                                  strokeDashoffset: (selectedDropId === src.id || selectedDropId === dst.id) ? [0, -20] : 0
                                }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                transition={{
                                  pathLength: { duration: 0.5, ease: "easeInOut" },
                                  strokeDashoffset: { repeat: Infinity, duration: 1, ease: "linear" }
                                }}
                                d={dPath}
                                fill="none"
                                stroke={traceColor}
                                strokeWidth={(hoveredDropId === src.id || hoveredDropId === dst.id || selectedDropId === src.id || selectedDropId === dst.id) || isBroken ? "3" : "1.5"}
                                strokeDasharray={(selectedDropId === src.id || selectedDropId === dst.id) ? "10,5" : "none"}
                                className={cn(isBroken && !isSimulating && 'animate-pulse')}
                                style={{
                                  filter: isDark && (hoveredDropId === src.id || hoveredDropId === dst.id || selectedDropId === src.id || selectedDropId === dst.id)
                                    ? `drop-shadow(0 0 8px ${traceColor})`
                                    : 'none'
                                }}
                              />
                            );
                          })}
                        </AnimatePresence>
                      </svg>





                      {/* ── Swimlane Rows ── */}
                      {viewLevel === 'team' ? (
                        <div className="flex flex-col gap-0">
                          {TEAM_MEMBERS
                            .filter(m => !focusedMemberId || m.id === focusedMemberId)
                            .map((member) => {
                              const originalIndex = TEAM_MEMBERS.findIndex(m => m.id === member.id);
                              const memberDrops = drops.filter(d => d.lane === originalIndex);
                              const isFocused = focusedMemberId === member.id;
                              const isExpanded = expandedMemberIds.has(member.id);
                              const empData = mockEmployees.find(e => e.name.toLowerCase().includes(member.name.toLowerCase())) || mockEmployees[0];

                              // For Focused Mode, group drops by stream
                              const dropsByStream: Record<string, DropData[]> = {};
                              if (isFocused) {
                                memberDrops.forEach(d => {
                                  const sId = d.streamId || 'unassigned';
                                  if (!dropsByStream[sId]) dropsByStream[sId] = [];
                                  dropsByStream[sId].push(d);
                                });
                              }

                              return (
                                <motion.div
                                  key={member.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={cn(
                                    "relative",
                                    isFocused
                                      ? "z-[100] bg-white dark:bg-teal-950/5 shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_0_40px_rgba(20,184,166,0.1)] border-t border-black/[0.03] dark:border-teal-500/30"
                                      : "dark:border-b dark:border-border",
                                    isFocused && isExpanded && "rounded-b-[40px] overflow-hidden",
                                    highlightHotLanes && (parseInt(member.id) === 3 || parseInt(member.id) === 5) && !isFocused && "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/40 dark:shadow-[inset_0_0_50px_rgba(245,158,11,0.05)]"
                                  )}
                                  style={{ minWidth: (PROJECT_END_X * zoomScale) + 320 }}
                                >
                                  <div className="flex items-center relative group">
                                    {/* Member Sidebar */}
                                    <div
                                      className={cn(
                                        "shrink-0 flex items-center gap-4 py-6 px-8 sticky left-0 z-[60] dark:border-r dark:border-slate-900/50 bg-background/95 dark:bg-slate-950 w-80",
                                        isFocused
                                          ? "shadow-[20px_0_40px_rgba(0,0,0,0.03)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.8)] rounded-l-[38px]"
                                          : "shadow-[10px_0_30px_rgba(0,0,0,0.02)] dark:shadow-[15px_0_40px_rgba(0,0,0,0.7)]"
                                      )}
                                    >
                                      <div className="flex-1 min-w-0 flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-black/[0.03] dark:border-slate-700 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-lg group-hover:border-teal-500/50 dark:group-hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all">
                                            <span className="text-slate-900 dark:text-slate-200 font-bold text-lg">{member.name.charAt(0)}</span>
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-foreground truncate text-lg tracking-tight hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                                              {member.name}
                                            </span>
                                            <div className="flex flex-col gap-1.5 mt-1.5">
                                              <div className={cn(
                                                'text-[10px] font-bold px-1.5 py-0.5 rounded transition-all duration-500 w-fit border',
                                                (memberVelocity[member.id] || 0) >= 0
                                                  ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20 dark:shadow-[0_0_8px_rgba(34,197,94,0.1)]'
                                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-500/20 dark:shadow-[0_0_8px_rgba(245,158,11,0.1)]'
                                              )}>
                                                {(memberVelocity[member.id] || 0) >= 0 ? '+' : ''}{memberVelocity[member.id] || 0}%
                                              </div>

                                              {/* Task 3: Resource Load Metrics */}
                                              <div className="flex items-center gap-2">
                                                <span className={cn(
                                                  "text-[10px] font-black uppercase tracking-tighter transition-colors duration-500",
                                                  (parseInt(member.id) === 3 || parseInt(member.id) === 5) ? (highlightHotLanes ? (isDark ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "text-amber-600") : "text-amber-600 dark:text-amber-500") : "text-emerald-600 dark:text-emerald-400"
                                                )}>
                                                  {(parseInt(member.id) === 3 || parseInt(member.id) === 5) ? "145% Load" : "78% Load"}
                                                </span>
                                                <span className="text-[9px] text-slate-500 font-bold italic truncate max-w-[80px]">
                                                  {parseInt(member.id) % 2 === 0 ? "free at 2 p.m." : "out Mon"}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <button
                                        onClick={(e) => toggleMemberExpand(member.id, e)}
                                        className={cn(
                                          'shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all shadow-sm dark:shadow-none',
                                          isFocused
                                            ? 'bg-teal-400 dark:bg-teal-500 text-slate-950 dark:text-white border-teal-300 dark:border-teal-400 hover:bg-teal-500 dark:hover:bg-teal-600 shadow-lg'
                                            : 'border-slate-200/60 dark:border-white/10 text-muted-foreground hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:text-teal-600 dark:hover:text-teal-400'
                                        )}
                                      >
                                        <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isFocused && 'rotate-180')} />
                                      </button>
                                    </div>

                                    {/* Timeline / Macro-Bar */}
                                    <div className="flex-1 h-full relative dark:border-l dark:border-slate-800/30 min-h-[100px] flex items-center">
                                      {!isFocused ? (
                                        /* MACRO-FLATTENED VIEW: Liquid Tube using Drop component */
                                        <div className="absolute inset-0 flex items-center">
                                          <AnimatePresence>
                                            {memberDrops.map(drop => {
                                              const streamDef = STAGING_STREAM_MAP[drop.streamId || ''];
                                              const streamColorHex = streamDef ? getStreamColor(streamDef.colorKey).hex : '#64748b';
                                              const intensity = 1.2; // Consistent intensity for macro view
                                              return (
                                                <Drop
                                                  key={`macro-${member.id}-${drop.id}`}
                                                  {...drop}
                                                  variant="minimal"
                                                  intensity={intensity}
                                                  streamColorHex={streamColorHex}
                                                  zoomScale={zoomScale}
                                                  onHoverStream={setHoveredStreamId}
                                                  hoveredStreamId={hoveredStreamId}
                                                  onHoverDrop={handleHoverDrop}
                                                  selectedDropId={selectedDropId}
                                                  onSelectDrop={setSelectedDropId}

                                                  hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                                  isBlocked={drop.isBlocked}
                                                  isReady={drop.isReady}
                                                  ownerName={member.name}
                                                />
                                              );
                                            })}
                                          </AnimatePresence>
                                        </div>
                                      ) : (
                                        /* FOCUSED VIEW PLACEHOLDER (Actual sub-lanes are rendered below) */
                                        <div className="flex-1" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Focus Mode Sub-Lanes */}
                                  {isFocused && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="border-x border-b dark:border-slate-800/30 border-border rounded-b-[40px] bg-slate-50/50 dark:bg-slate-900/20 overflow-visible"
                                    >
                                      <div className="pl-16 relative py-4">
                                        {/* Hierarchy Line */}
                                        <div className="absolute left-10 top-0 bottom-10 w-px border-l border-dashed border-slate-700/50" />

                                        {Object.entries(dropsByStream).map(([streamId, streamDrops]) => {
                                          const stream = STAGING_STREAM_MAP[streamId];
                                          const streamColor = stream ? getStreamColor(stream.colorKey).hex : '#475569';

                                          return (
                                            <div
                                              key={streamId}
                                              className="relative flex items-center min-h-[85px] border-t border-slate-800/30 group/sublane"
                                              style={{ minWidth: (PROJECT_END_X * zoomScale) + 320 - 64 }}
                                            >
                                              {/* Sub-Header Horizontal connector */}
                                              <div className="absolute left-[-24px] top-1/2 w-6 border-t border-dashed border-slate-700/50" />

                                              <div
                                                className="shrink-0 flex items-center gap-3 px-8 py-4 border-r border-border dark:border-slate-800/30 sticky left-0 z-[55] bg-background/95 dark:bg-slate-950 dark:shadow-[12px_0_35px_rgba(0,0,0,0.6)]"
                                                style={{ width: 320 - 64 }}
                                              >
                                                <div
                                                  className="w-2 h-8 rounded-full"
                                                  style={{ backgroundColor: streamColor }}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                  <span
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (stream) router.push(`/library?expand=${stream.id}`);
                                                    }}
                                                    className="text-xs font-bold text-foreground truncate group-hover/sublane:text-teal-600 dark:group-hover/sublane:text-teal-400 cursor-pointer hover:underline underline-offset-4"
                                                  >
                                                    {stream?.title || 'Unassigned'}
                                                  </span>
                                                  <span className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                                                    {streamDrops.length} Drops
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="flex-1 h-full relative">
                                                <div className="absolute inset-0 flex items-center">
                                                  {streamDrops.map(drop => {
                                                    const streamDef = STAGING_STREAM_MAP[drop.streamId || ''];
                                                    const streamColorHex = streamDef ? getStreamColor(streamDef.colorKey).hex : '#64748b';
                                                    const isLateCriticalPath = false;

                                                    return (
                                                      <Drop
                                                        key={drop.id}
                                                        {...drop}
                                                        ownerName={member.name}
                                                        streamColorHex={streamColorHex}
                                                        streamName={streamDef?.title}
                                                        ownerVelocity={memberVelocity[member.id]}


                                                        references={drop.references}
                                                        onAction={handleDropAction}
                                                        onDragEnd={handleDragEnd}
                                                        zoomScale={zoomScale}
                                                        onHoverStream={setHoveredStreamId}
                                                        hoveredStreamId={hoveredStreamId}
                                                        onHoverDrop={handleHoverDrop}
                                                        selectedDropId={selectedDropId}
                                                        onSelectDrop={setSelectedDropId}
                                                        hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                                        isBlocked={drop.isBlocked}
                                                        forceDimmed={false}
                                                        isCriticalPath={false}
                                                        isLateCriticalPath={false}
                                                        isReady={drop.isReady}
                                                        variant="full"
                                                        enableStreamHover={false}
                                                      />
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              );
                            })}
                        </div>
                      ) : (
                        // ── OVERVIEW (STREAMS) VIEW ──
                        <div className="flex flex-col gap-0">
                          {[...STAGING_STREAMS]
                            .filter(s => !focusedStreamId || s.id === focusedStreamId)
                            .sort((a, b) => {
                              const minA = Math.min(...drops.filter(d => d.streamId === a.id).map(d => d.xOffset), Infinity);
                              const minB = Math.min(...drops.filter(d => d.streamId === b.id).map(d => d.xOffset), Infinity);
                              return minA - minB;
                            }).map((stream) => {
                              const stats = streamStats.find(s => s.id === stream.id)!;
                              const isExpanded = expandedStreamIds.has(stream.id);
                              const streamDef = STAGING_STREAM_MAP[stream.id];
                              const streamColor = getStreamColor(streamDef?.colorKey);
                              const isFocused = focusedStreamId === stream.id;

                              return (
                                <motion.div
                                  key={stream.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={cn(
                                    "relative",
                                    isFocused
                                      ? "z-[100] bg-white dark:bg-teal-950/5 shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_0_40px_rgba(20,184,166,0.1)] border-t border-black/[0.03] dark:border-teal-500/30"
                                      : "dark:border-b dark:border-border",
                                    isFocused && isExpanded && "rounded-b-[40px] overflow-hidden"
                                  )}
                                  style={{ minWidth: (PROJECT_END_X * zoomScale) + currentSidebarWidth }}
                                  data-stream-id={stream.id}
                                >
                                  {/* Stream Header Row */}
                                  <div className="flex items-center relative group">
                                    {/* Stream Sidebar */}
                                    <div
                                      className={cn(
                                        "shrink-0 flex items-center gap-4 py-6 px-8 sticky left-0 z-[60] dark:border-r dark:border-slate-900/50 bg-background/95 dark:bg-slate-950",
                                        isFocused
                                          ? "shadow-[20px_0_40px_rgba(0,0,0,0.03)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.8)]"
                                          : (isDark ? "shadow-[15px_0_40px_rgba(0,0,0,0.7)]" : "shadow-[10px_0_30px_rgba(0,0,0,0.02)]")
                                      )}
                                      style={{ width: currentSidebarWidth }}
                                    >
                                      {/* Stream Content Stack */}
                                      <div className="flex-1 min-w-0 flex flex-col gap-3">
                                        {/* Top Line: Name and Focus Controls */}
                                        <div className="flex-1 flex items-center gap-3 group/title">
                                          <h3
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              router.push(`/library?expand=${stream.id}`);
                                            }}
                                            className={cn(
                                              "flex-1 font-bold transition-all truncate tracking-tight cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 hover:underline underline-offset-4",
                                              isFocused ? "text-xl text-foreground" : "text-sm text-foreground group-hover/title:text-foreground"
                                            )}
                                          >
                                            {stream.title}
                                          </h3>

                                          {!isFocused && (
                                            <button
                                              onClick={() => setSelectedStreamDependencyId(selectedStreamDependencyId === stream.id ? null : stream.id)}
                                              className={cn("p-1 rounded-md opacity-0 group-hover/title:opacity-100 transition-all ml-1",
                                                selectedStreamDependencyId === stream.id ? "opacity-100 bg-teal-100/70 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400" : "text-muted-foreground hover:text-foreground hover:bg-muted")}
                                            >
                                              <Link className="w-3.5 h-3.5" />
                                            </button>
                                          )}

                                          {stats.hasBlocker && (
                                            <div className="shrink-0 animate-pulse ml-2">
                                              <AlertTriangle className="w-4 h-4 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                                            </div>
                                          )}
                                        </div>

                                        {/* Bottom Line: Progress Bar */}
                                        <div className="flex items-center gap-4">
                                          <div
                                            className="h-7 w-10 shrink-0 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm border relative"
                                            style={{
                                              backgroundColor: `${streamColor.hex}15`,
                                              borderColor: `${streamColor.hex}40`,
                                              color: streamColor.hex
                                            }}
                                          >
                                            {stream.initials}
                                          </div>

                                          <div className="flex-1 flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-muted dark:bg-slate-900 rounded-full overflow-hidden border border-border dark:border-white/5">
                                              <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats.percent}%` }}
                                                className="h-full rounded-full"
                                                style={{
                                                  backgroundColor: streamColor.hex,
                                                  boxShadow: theme === 'dark' ? `0 0 15px ${streamColor.hex}60` : 'none'
                                                }}
                                              />
                                            </div>
                                            <span className="text-xs font-black text-muted-foreground tabular-nums">{stats.percent}%</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action button on the far right of sidebar */}
                                      <button
                                        onClick={() => toggleStreamExpand(stream.id)}
                                        className={cn(
                                          'shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all shadow-sm dark:shadow-none',
                                          isExpanded
                                            ? 'bg-teal-400 dark:bg-teal-500 text-slate-950 dark:text-white border-teal-300 dark:border-teal-400 hover:bg-teal-500 dark:hover:bg-teal-600 shadow-lg dark:shadow-teal-500/20'
                                            : 'border-slate-200/60 dark:border-white/10 text-muted-foreground hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:text-teal-600 dark:hover:text-teal-400'
                                        )}
                                      >
                                        <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isExpanded && 'rotate-180')} />
                                      </button>
                                    </div>

                                    {/* Timeline Area (Collapsed View) */}
                                    <div className="flex-1 h-full relative dark:border-l dark:border-slate-800/30 overflow-visible min-h-[100px] flex items-center">
                                      <div className="absolute inset-0 flex items-center">
                                        <AnimatePresence>
                                          {!isExpanded && stats.drops.map(drop => {
                                            // Calculate Overlap Intensity
                                            const dropWidth = getDropWidth(drop, zoomScale);
                                            const dropStart = drop.xOffset;
                                            const dropEnd = drop.xOffset + (dropWidth / zoomScale);

                                            const intensity = stats.drops.filter(other => {
                                              if (other.id === drop.id) return false;
                                              const otherWidth = getDropWidth(other, zoomScale);
                                              const otherStart = other.xOffset;
                                              const otherEnd = other.xOffset + (otherWidth / zoomScale);
                                              // Check overlap
                                              return dropStart < otherEnd && dropEnd > otherStart;
                                            }).length + 1;

                                            const owner = TEAM_MEMBERS[drop.lane]?.name || 'Unknown';

                                            return (
                                              <Drop
                                                key={`${stream.id}-${drop.id}`}
                                                {...drop}
                                                ownerName={owner}
                                                intensity={intensity}
                                                streamInitials={stream.initials}
                                                streamColorHex={streamColor.hex}


                                                references={drop.references}
                                                onAction={handleDropAction}
                                                onDragEnd={handleDragEnd}
                                                zoomScale={zoomScale}
                                                onHoverStream={setHoveredStreamId}
                                                hoveredStreamId={hoveredStreamId}
                                                onHoverDrop={handleHoverDrop}
                                                selectedDropId={selectedDropId}
                                                onSelectDrop={setSelectedDropId}
                                                hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                                isBlocked={drop.isBlocked}
                                                forceDimmed={false}
                                                isCriticalPath={false}
                                                isReady={drop.isReady}
                                                variant="minimal"
                                              />
                                            );
                                          })}
                                        </AnimatePresence>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expandable Sub-Lanes */}
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className={cn(
                                        "dark:border-x dark:border-b dark:border-slate-800/30 border-border rounded-b-[40px]",
                                        isFocused ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/50 dark:bg-slate-950/20"
                                      )}
                                    >
                                      <div className="pl-16 relative">
                                        {/* Hierarchy Line */}
                                        <div className="absolute left-10 top-0 bottom-10 w-px border-l border-dashed border-slate-700/50" />

                                        {stats.contributors.map(laneIdx => {
                                          const member = TEAM_MEMBERS[laneIdx];
                                          const memberDrops = stats.drops.filter(d => d.lane === laneIdx);
                                          if (memberDrops.length === 0) return null;

                                          return (
                                            <div
                                              key={laneIdx}
                                              className="relative flex items-center min-h-[85px] border-t border-slate-800/30 group/sublane"
                                              style={{ minWidth: (PROJECT_END_X * zoomScale) + currentSidebarWidth - 64 }}
                                            >
                                              {/* Sub-Header Horizontal connector */}
                                              <div className="absolute left-[-24px] top-1/2 w-6 border-t border-dashed border-slate-700/50" />

                                              <div
                                                className="shrink-0 flex items-center gap-3 px-8 py-4 border-r border-border dark:border-slate-800/30 sticky left-0 z-[55] bg-background/95 dark:bg-slate-950 dark:shadow-[12px_0_35px_rgba(0,0,0,0.6)]"
                                                style={{ width: currentSidebarWidth - 64 }}
                                              >
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-black/[0.03] dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-900 dark:text-slate-200 group-hover/sublane:border-teal-500/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-lg">
                                                  {member.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-semibold text-muted-foreground group-hover/sublane:text-foreground whitespace-nowrap">
                                                  {member.name}
                                                </span>
                                              </div>

                                              <div className="flex-1 h-full relative">
                                                <div className="absolute inset-0 flex items-center">
                                                  {memberDrops.map(drop => (
                                                    <Drop
                                                      key={`${stream.id}-${member.id}-${drop.id}`}
                                                      {...drop}
                                                      streamColorHex={streamColor.hex}


                                                      references={drop.references}
                                                      onAction={handleDropAction}
                                                      onDragEnd={handleDragEnd}
                                                      zoomScale={zoomScale}
                                                      onHoverStream={setHoveredStreamId}
                                                      hoveredStreamId={hoveredStreamId}
                                                      onHoverDrop={handleHoverDrop}
                                                      selectedDropId={selectedDropId}
                                                      onSelectDrop={setSelectedDropId}
                                                      hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                                      isBlocked={drop.isBlocked}
                                                      variant="full"
                                                      enableStreamHover={false}
                                                    />
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>




      <AnimatePresence>
        {isBurndownOpen && (
          <BurndownOverlay onClose={() => setIsBurndownOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
