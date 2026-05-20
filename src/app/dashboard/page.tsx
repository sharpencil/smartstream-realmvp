'use client';

import { PulseDashboard } from "@/components/PulseDashboard";
import { MyFlowDashboard } from "@/components/MyFlowDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { usePersona } from "@/context/PersonaContext";

export default function DashboardPage() {
  const { activePersona } = usePersona();

  return (
    <div className="h-full">
      {activePersona === 'Admin' ? (
        <AdminDashboard />
      ) : activePersona === 'Team Member' ? (
        <MyFlowDashboard />
      ) : (
        <PulseDashboard />
      )}
    </div>
  );
}
