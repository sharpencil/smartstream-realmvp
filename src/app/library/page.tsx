import { LibraryDashboard } from '@/components/LibraryDashboard';
import { Suspense } from 'react';

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-transparent">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Syncing streams...
        </div>
      </div>
    }>
      <LibraryDashboard />
    </Suspense>
  );
}
