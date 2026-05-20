'use client';

import { PulseDashboard } from "@/components/PulseDashboard";
import { MyFlowDashboard } from "@/components/MyFlowDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SignUpPage } from "@/components/SignUpPage";
import { usePersona } from "@/context/PersonaContext";
import { useOrg } from "@/context/OrgContext";

export default function Home() {
  const { activePersona } = usePersona();
  const { orgState } = useOrg();

  // If no organization has been set up, render the Genesis Sign-Up page at the root route
  if (!orgState) {
    return <SignUpPage />;
  }

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
