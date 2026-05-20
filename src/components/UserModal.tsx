'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceUser, WorkspaceProject, useOrg } from '@/context/OrgContext';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { User, Shield, Check } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: WorkspaceUser | null;
}

export function UserModal({ isOpen, onClose, userToEdit }: UserModalProps) {
  const { inviteUser, updateUser, projects } = useOrg();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<WorkspaceUser['role'][]>(['Team Member']);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Hydrate form if editing
  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRoles(Array.isArray(userToEdit.roles) && userToEdit.roles.length > 0 ? userToEdit.roles : [userToEdit.role]);
      setSelectedProjects(userToEdit.projects);
    } else {
      setName('');
      setEmail('');
      setRoles(['Team Member']);
      setSelectedProjects([]);
    }
    setError('');
  }, [userToEdit, isOpen]);

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const ALL_ROLES: WorkspaceUser['role'][] = ['Admin', 'Project Owner', 'Project Manager', 'Team Member'];

  const handleToggleRole = (role: WorkspaceUser['role']) => {
    const isLocked = userToEdit?.id === 'admin-user' && role === 'Admin';
    if (isLocked) return;
    setRoles((prev) => {
      const isActive = prev.includes(role);
      // Prevent deselecting the last role
      if (isActive && prev.length === 1) return prev;
      return isActive ? prev.filter((r) => r !== role) : [...prev, role];
    });
  };

  const getRoleStyle = (role: WorkspaceUser['role'], isSelected: boolean) => {
    if (!isSelected) return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10';
    switch (role) {
      case 'Admin':          return 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-[0_2px_8px_rgba(239,68,68,0.1)]';
      case 'Project Owner':  return 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-[0_2px_8px_rgba(168,85,247,0.1)]';
      case 'Project Manager':return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-[0_2px_8px_rgba(99,102,241,0.1)]';
      case 'Team Member':    return 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-[0_2px_8px_rgba(20,184,166,0.1)]';
      default:               return 'bg-slate-500/10 border-slate-500/30 text-slate-500';
    }
  };

  const getRoleCheckColor = (role: WorkspaceUser['role']) => {
    switch (role) {
      case 'Admin':          return 'text-rose-500';
      case 'Project Owner':  return 'text-purple-500';
      case 'Project Manager':return 'text-indigo-500';
      case 'Team Member':    return 'text-teal-500';
      default:               return 'text-slate-500';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid work email.');
      return;
    }

    if (userToEdit) {
      updateUser(userToEdit.id, name, email, roles, selectedProjects, userToEdit.status);
    } else {
      inviteUser(name, email, roles, selectedProjects);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            {userToEdit ? 'Edit Workspace Profile' : 'Invite New Team Member'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {userToEdit 
              ? 'Update role allocations, workspace project connections, and metadata.' 
              : 'Add a new member to your continuous flow pipeline. They will be added as "Pending Invite".'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1 pl-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Lena Vane"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1 pl-1">
              Work Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g. lena@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 transition-all duration-300"
                disabled={!!userToEdit && userToEdit.id === 'admin-user'} // Lock admin email to avoid breaking the core profile
              />
            </div>
          </div>

          {/* Role multi-select checklist */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1 pl-1">
              <Shield className="w-3 h-3" />
              Security Roles
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 rounded-xl min-h-[60px]">
              {ALL_ROLES.map((r) => {
                const isSelected = roles.includes(r);
                const isLocked = userToEdit?.id === 'admin-user' && r === 'Admin';
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => handleToggleRole(r)}
                    disabled={isLocked}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                      getRoleStyle(r, isSelected)
                    } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isSelected && <Check className={`w-3 h-3 ${getRoleCheckColor(r)}`} />}
                    <span>{r}</span>
                  </button>
                );
              })}
            </div>
            {roles.length === 0 && (
              <p className="text-[10px] text-rose-500 pl-1">At least one role must be selected.</p>
            )}
          </div>

          {/* Project multiselect */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1 pl-1">
              Project Assignments
            </label>
            
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 rounded-xl min-h-[60px] max-h-[140px] overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-mono">No active projects found. Add projects first.</p>
              ) : (
                projects.map((proj) => {
                  const isSelected = selectedProjects.includes(proj.id);
                  return (
                    <button
                      type="button"
                      key={proj.id}
                      onClick={() => handleToggleProject(proj.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400 font-extrabold shadow-[0_2px_8px_rgba(20,184,166,0.1)]'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-teal-500" />}
                      <span>{proj.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="text-[10px] h-[38px] px-5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="text-[10px] h-[38px] px-6 cursor-pointer"
            >
              {userToEdit ? 'Save Changes' : 'Invite User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
