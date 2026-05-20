'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceProject, useOrg } from '@/context/OrgContext';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, FileText, CheckCircle2 } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: WorkspaceProject | null;
}

export function ProjectModal({ isOpen, onClose, projectToEdit }: ProjectModalProps) {
  const { createProject, updateProject } = useOrg();
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkspaceProject['status']>('Active');
  const [error, setError] = useState('');

  // Hydrate form if editing
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setStatus(projectToEdit.status);
    } else {
      setName('');
      setDescription('');
      setStatus('Active');
    }
    setError('');
  }, [projectToEdit, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    if (projectToEdit) {
      updateProject(projectToEdit.id, name, description, status);
    } else {
      createProject(name, description, status);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-cyan-500" />
            {projectToEdit ? 'Configure Project' : 'Initiate New Project'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {projectToEdit 
              ? 'Modify the project metadata and operational state.' 
              : 'Add a new active project for drop sequencing and CFM tracking.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1 pl-1">
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. AI Evaluation Layer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1 pl-1">
              Project Description
            </label>
            <textarea
              placeholder="Provide a detailed roadmap, requirements, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300 resize-none"
            />
          </div>

          {/* Status select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1 pl-1">
              Project Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkspaceProject['status'])}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300 cursor-pointer appearance-none"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-cyan-500/70" />
              </div>
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
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
