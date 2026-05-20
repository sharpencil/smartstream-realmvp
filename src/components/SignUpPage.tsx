'use client';

import React, { useState } from 'react';
import { useOrg } from '@/context/OrgContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Building, Mail, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SignUpPage() {
  const { createWorkspace } = useOrg();
  const router = useRouter();
  
  // Form fields state
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Quick validation
    if (!fullName.trim() || !workEmail.trim() || !orgName.trim()) {
      setError('Please fill in all fields to launch your command console.');
      return;
    }

    if (!workEmail.includes('@') || !workEmail.includes('.')) {
      setError('Please enter a valid work email.');
      return;
    }

    setLoading(true);

    // Simulate slightly slick loading transition
    setTimeout(() => {
      createWorkspace(fullName, workEmail, orgName);
      setLoading(false);
      router.push('/');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fafafa] dark:bg-[#020617] transition-colors duration-700 px-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-[120px] pointer-events-none" />
      
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] z-10"
      >
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="h-16 w-auto mb-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/SmartStreamLogo.svg" 
              alt="SmartStream" 
              className="h-full w-auto object-contain dark:drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] dark:invert-[0.05]" 
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/5 px-4 py-1.5 rounded-full border border-cyan-500/20"
          >
            Genesis Protocol
          </motion.p>
        </div>

        {/* Glassmorphic Signup Card */}
        <div className="relative rounded-[32px] overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.4)] p-8 md:p-10">
          
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 text-center">
            Register Your Organization
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-8">
            Create your high-density Command Console for continuous flow methodology.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                <User className="w-3.5 h-3.5 text-cyan-500/70" />
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 focus:bg-white dark:focus:bg-slate-950 transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Work Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                <Mail className="w-3.5 h-3.5 text-cyan-500/70" />
                Work Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="e.g. john@yourcompany.com"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  className="w-full bg-white/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 focus:bg-white dark:focus:bg-slate-950 transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Organization Name Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5 pl-1">
                <Building className="w-3.5 h-3.5 text-cyan-500/70" />
                Organization Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. Stark Industries"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-white/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 focus:bg-white dark:focus:bg-slate-950 transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Action Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] text-xs flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 dark:border-white border-t-transparent animate-spin" />
                  <span>Configuring Systems...</span>
                </div>
              ) : (
                <>
                  <span>Create My Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Demo Footer */}
        <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mt-6 tracking-wide font-medium">
          Powered by SmartStream Continuous Flow Methodology.
        </p>
      </motion.div>
    </div>
  );
}
