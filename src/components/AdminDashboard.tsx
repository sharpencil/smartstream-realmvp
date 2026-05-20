'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOrg, WorkspaceUser, WorkspaceProject } from '@/context/OrgContext';
import { UserModal } from '@/components/UserModal';
import { ProjectModal } from '@/components/ProjectModal';
import { 
  Users, LayoutDashboard, Shield, Plus, Edit2, Trash2, 
  Settings, Building, Sparkles, CreditCard, Check, ChevronDown, Save, X, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  const { 
    orgState, users, projects, activeAdminTab, setActiveAdminTab,
    deleteUser, deleteProject, updateUser, updateOrgState
  } = useOrg();

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<WorkspaceUser | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<WorkspaceProject | null>(null);

  // Settings inline edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editOrgName, setEditOrgName] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const handleStartEditProfile = () => {
    setEditOrgName(orgState?.orgName || '');
    setEditFullName(orgState?.fullName || '');
    setEditEmail(orgState?.workEmail || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (editOrgName.trim() && editFullName.trim() && editEmail.trim()) {
      updateOrgState(editFullName.trim(), editEmail.trim(), editOrgName.trim());
    }
    setIsEditingProfile(false);
  };

  // Inline role multi-select popover — portal-based to escape overflow clipping
  const [dropdownAnchor, setDropdownAnchor] = useState<{
    userId: string;
    top: number;
    left: number;
  } | null>(null);
  const rolePortalRef = useRef<HTMLDivElement>(null);

  // Close role dropdown on outside click (checks both trigger area and portal)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rolePortalRef.current && !rolePortalRef.current.contains(e.target as Node)) {
        setDropdownAnchor(null);
      }
    };
    if (dropdownAnchor) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownAnchor]);

  const handleRoleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    if (dropdownAnchor?.userId === userId) {
      setDropdownAnchor(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownAnchor({
      userId,
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
  };

  const handleEditUser = (user: WorkspaceUser) => {
    setEditingUser(user);
    setUserModalOpen(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleEditProject = (proj: WorkspaceProject) => {
    setEditingProject(proj);
    setProjectModalOpen(true);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  // Inline multi-role toggle in the table popover
  const ALL_ROLES: WorkspaceUser['role'][] = ['Admin', 'Project Owner', 'Project Manager', 'Team Member'];

  const handleRoleToggle = (user: WorkspaceUser, role: WorkspaceUser['role']) => {
    const currentRoles = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role];
    const isActive = currentRoles.includes(role);
    // Prevent removing Admin from the master admin user
    if (user.id === 'admin-user' && role === 'Admin') return;
    // Prevent deselecting last role
    if (isActive && currentRoles.length === 1) return;
    const nextRoles = isActive
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    updateUser(user.id, user.name, user.email, nextRoles, user.projects, user.status);
  };

  const getRoleStyle = (role: WorkspaceUser['role']) => {
    switch (role) {
      case 'Admin':          return 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400';
      case 'Project Owner':  return 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400';
      case 'Project Manager':return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400';
      case 'Team Member':    return 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400';
      default:               return 'bg-slate-500/10 border-slate-500/30 text-slate-500';
    }
  };

  const getRoleCheckStyle = (role: WorkspaceUser['role']) => {
    switch (role) {
      case 'Admin':          return 'text-rose-500';
      case 'Project Owner':  return 'text-purple-500';
      case 'Project Manager':return 'text-indigo-500';
      case 'Team Member':    return 'text-teal-500';
      default:               return 'text-slate-500';
    }
  };

  // Stream colors key mapping (for badges)
  const getStreamColor = (initials: string) => {
    const sum = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400',
      'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
      'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
      'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
      'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    ];
    return colors[sum % colors.length];
  };

  return (
    <div className="h-full w-full py-8 px-8 flex flex-col gap-8 bg-slate-50 dark:bg-[#020617] min-h-screen text-slate-900 dark:text-slate-100 transition-all duration-700">
      
      {/* Header Cockpit Title */}
      <div className="relative flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
          Admin Cockpit
        </h1>

        {/* Centered Tab Headers (Sync with context activeAdminTab, aligned centrally on the same line as title) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 p-1 bg-slate-100/80 dark:bg-slate-900/60 border border-black/[0.03] dark:border-slate-800/60 rounded-full dark:shadow-inner dark:shadow-black/20 flex-nowrap h-auto">
          {[
            { id: 'users', label: 'Users' },
            { id: 'projects', label: 'Projects' },
            { id: 'settings', label: 'Organization Settings' }
          ].map((tab) => {
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={cn(
                  "relative px-6 py-2 rounded-full text-sm tracking-wide transition-colors outline-none whitespace-nowrap z-10 cursor-pointer",
                  isActive 
                    ? "text-slate-900 dark:text-cyan-400 font-medium" 
                    : "text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground group"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPebbleAdmin"
                    className="absolute inset-0 bg-white dark:bg-cyan-950/80 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-none border-none dark:border dark:border-cyan-500/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-20 font-bold uppercase text-[11px] tracking-widest">{tab.label}</span>
                
                {/* Hover Indicator (Slate Dot) */}
                {!isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Content Area Toggle Subviews */}
      <div className="flex-1 bg-white/50 dark:bg-[#0a192f]/20 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-[32px] p-6 shadow-arctic flex flex-col min-h-[400px]">
        
        {/* Dynamic Tab Body */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* SUB-VIEW 1: USERS */}
            {activeAdminTab === 'users' && (
              <motion.div
                key="users-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4 flex flex-col h-full"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">User & Role Directory</h2>
                    <p className="text-[11px] text-slate-400">Add, modify security credentials, and map workspace members to specific projects.</p>
                  </div>
                  <Button
                    onClick={handleCreateUser}
                    className="px-5 py-2.5 text-sm font-bold uppercase tracking-widest gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    INVITE USER
                  </Button>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-white/5 rounded-[20px] bg-white/40 dark:bg-slate-950/20">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/35 uppercase text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-4">Email</th>
                        <th className="py-4 px-4">Assigned Projects</th>
                        <th className="py-4 px-4">Role</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-slate-100/30 dark:hover:bg-teal-950/10 transition-colors"
                        >
                          {/* Name */}
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-black/[0.03] dark:border-teal-500/20 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none flex items-center justify-center font-bold text-xs text-slate-900 dark:text-teal-400">
                              {user.name.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <span className="truncate max-w-[120px]">{user.name}</span>
                          </td>
                          {/* Email */}
                          <td className="py-4 px-4 text-slate-500 font-mono select-all truncate max-w-[150px]">{user.email}</td>
                          {/* Projects Assigned */}
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {user.projects.length === 0 ? (
                                <span className="text-[10px] text-slate-400 dark:text-slate-600 italic">None Assigned</span>
                              ) : (
                                user.projects.map((pId) => {
                                  const proj = projects.find((p) => p.id === pId);
                                  if (!proj) return null;
                                  return (
                                    <span 
                                      key={pId} 
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStreamColor(proj.initials)}`}
                                      title={proj.name}
                                    >
                                      {proj.initials}
                                    </span>
                                  );
                                })
                              )}
                            </div>
                          </td>
                          {/* Role multi-select popover */}
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              onClick={(e) => user.id !== 'admin-user' && handleRoleTriggerClick(e, user.id)}
                              className="flex flex-wrap items-center gap-1 min-w-[110px] max-w-[200px] group cursor-pointer"
                              title="Click to manage roles"
                            >
                              {(Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role]).map((r) => (
                                <span
                                  key={r}
                                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getRoleStyle(r)}`}
                                >
                                  {r}
                                </span>
                              ))}
                              {user.id !== 'admin-user' && (
                                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors ml-0.5 shrink-0 dark:group-hover:text-slate-200" />
                              )}
                            </button>
                          </td>
                          {/* Status */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              user.status === 'Active'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-rose-500 dark:bg-rose-400'}`} />
                              {user.status}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                title="Edit user profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Delete user"
                                disabled={user.id === 'admin-user'} // Lock deletion on master admin user
                              >
                                <Trash2 className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* SUB-VIEW 2: PROJECTS */}
            {activeAdminTab === 'projects' && (
              <motion.div
                key="projects-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4 flex flex-col h-full"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Active Projects</h2>
                    <p className="text-[11px] text-slate-400">Establish continuous flow tracks for drop integration pipelines and project scheduling.</p>
                  </div>
                  <Button
                    onClick={handleCreateProject}
                    className="px-5 py-2.5 text-sm font-bold uppercase tracking-widest gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    CREATE PROJECT
                  </Button>
                </div>

                {/* Projects Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-white/5 rounded-[20px] bg-white/40 dark:bg-slate-950/20">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/35 uppercase text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500">
                        <th className="py-4 px-6">Project</th>
                        <th className="py-4 px-4">Initials</th>
                        <th className="py-4 px-4 w-[50%]">Description</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {projects.map((proj) => (
                        <tr 
                          key={proj.id} 
                          className="hover:bg-slate-100/30 dark:hover:bg-teal-950/10 transition-colors"
                        >
                          {/* Name */}
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span className="truncate max-w-[150px]">{proj.name}</span>
                          </td>
                          {/* Initials */}
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${getStreamColor(proj.initials)}`}>
                              {proj.initials}
                            </span>
                          </td>
                          {/* Description */}
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm truncate" title={proj.description}>
                            {proj.description || 'No description provided.'}
                          </td>
                          {/* Status */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              proj.status === 'Active'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : proj.status === 'Completed'
                                ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400'
                                : 'bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400'
                            }`}>
                              {proj.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />}
                              {proj.status}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProject(proj)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                title="Edit project"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteProject(proj.id)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Delete project"
                              >
                                <Trash2 className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* SUB-VIEW 3: SETTINGS */}
            {activeAdminTab === 'settings' && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Organization Profile</h2>
                  <p className="text-[11px] text-slate-400">Configure global metadata, billing cycles, and SaaS workspace properties.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Workspace Profile card — editable */}
                  <div className="bg-card dark:bg-slate-900/60 backdrop-blur-md border border-border dark:border-white/5 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border dark:border-white/5 bg-muted/50 dark:bg-slate-900/50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-slate-400" />
                        Workspace Profile
                      </h3>
                      {!isEditingProfile ? (
                        <button
                          onClick={handleStartEditProfile}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveProfile}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-5 space-y-4">
                      {/* Organization Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Organization</label>
                        {isEditingProfile ? (
                          <input
                            value={editOrgName}
                            onChange={(e) => setEditOrgName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 transition-all"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{orgState?.orgName}</p>
                        )}
                      </div>

                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Admin Full Name</label>
                        {isEditingProfile ? (
                          <input
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 transition-all"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{orgState?.fullName}</p>
                        )}
                      </div>

                      {/* Billing Email */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Billing Email</label>
                        {isEditingProfile ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-sm font-semibold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 transition-all"
                          />
                        ) : (
                          <p className="text-sm font-semibold font-mono text-slate-500 dark:text-slate-300">{orgState?.workEmail}</p>
                        )}
                      </div>

                      {/* Provision Date — read-only */}
                      <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/5">
                        <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Provision Date</label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {orgState && new Date(orgState.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: SaaS Allocation — read-only */}
                  <div className="bg-card dark:bg-slate-900/60 backdrop-blur-md border border-border dark:border-white/5 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border dark:border-white/5 bg-muted/50 dark:bg-slate-900/50">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        SaaS Allocation
                      </h3>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                      {/* Plan */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Current Plan</label>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          Enterprise Premium
                        </p>
                      </div>

                      {/* Active Seats */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Active Seats</label>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{users.length}</p>
                          <p className="text-xs text-slate-400 mb-0.5">of 20 max</p>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((users.length / 20) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">{20 - users.length} seats remaining</p>
                      </div>

                      {/* Cloud Status */}
                      <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/5">
                        <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Cloud Sandbox</label>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                          <p className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Active (Operational)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* CRUD Modals */}
      <UserModal 
        isOpen={userModalOpen} 
        onClose={() => {
          setUserModalOpen(false);
          setEditingUser(null);
        }}
        userToEdit={editingUser}
      />

      <ProjectModal 
        isOpen={projectModalOpen} 
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        projectToEdit={editingProject}
      />

      {/* Role dropdown portal — renders outside table's overflow-x-auto */}
      {dropdownAnchor && typeof document !== 'undefined' && createPortal(
        <div
          ref={rolePortalRef}
          style={{
            position: 'fixed',
            top: dropdownAnchor.top,
            left: dropdownAnchor.left,
            zIndex: 9999,
          }}
          className="w-52 bg-white dark:bg-[#0d1f3c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-2 pt-1 pb-2 border-b border-slate-100 dark:border-white/5">
            Assign Roles
          </p>
          {(() => {
            const user = users.find(u => u.id === dropdownAnchor.userId);
            if (!user) return null;
            return ALL_ROLES.map((role) => {
              const currentRoles = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role];
              const isChecked = currentRoles.includes(role);
              const isLocked = user.id === 'admin-user' && role === 'Admin';
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(user, role)}
                  disabled={isLocked}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-slate-50 dark:bg-slate-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    isChecked
                      ? `border-current bg-current/10 ${getRoleCheckStyle(role)}`
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isChecked && <Check className="w-2.5 h-2.5" />}
                  </span>
                  <span className={`${getRoleCheckStyle(role)} font-bold`}>{role}</span>
                </button>
              );
            });
          })()}
        </div>,
        document.body
      )}

    </div>
  );
}
