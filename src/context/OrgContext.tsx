'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePersona } from './PersonaContext';

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Project Owner' | 'Project Manager' | 'Team Member';
  roles: ('Admin' | 'Project Owner' | 'Project Manager' | 'Team Member')[];
  projects: string[]; // Project IDs
  status: 'Active' | 'Pending Invite';
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'Archived';
  initials: string;
}

export interface OrgState {
  fullName: string;
  workEmail: string;
  orgName: string;
  createdAt: string;
}

interface OrgContextType {
  orgState: OrgState | null;
  users: WorkspaceUser[];
  projects: WorkspaceProject[];
  activeAdminTab: 'users' | 'projects' | 'settings';
  setActiveAdminTab: (tab: 'users' | 'projects' | 'settings') => void;
  createWorkspace: (fullName: string, workEmail: string, orgName: string) => void;
  updateOrgState: (fullName: string, workEmail: string, orgName: string) => void;
  inviteUser: (name: string, email: string, roles: WorkspaceUser['role'][], projects: string[]) => void;
  updateUser: (id: string, name: string, email: string, roles: WorkspaceUser['role'][], projects: string[], status: WorkspaceUser['status']) => void;
  deleteUser: (id: string) => void;
  createProject: (name: string, description: string, status: WorkspaceProject['status']) => void;
  updateProject: (id: string, name: string, description: string, status: WorkspaceProject['status']) => void;
  deleteProject: (id: string) => void;
  clearWorkspace: () => void;
  loaded: boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

// Helper to generate initials from a name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
};

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const { setActivePersona } = usePersona();
  
  // State variables
  const [orgState, setOrgState] = useState<OrgState | null>(null);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'projects' | 'settings'>('users');
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsers = localStorage.getItem('smartstream_users');
      const savedProjects = localStorage.getItem('smartstream_projects');

      const savedOrg = localStorage.getItem('smartstream_orgState');
      if (savedOrg && savedOrg !== 'null' && savedOrg !== 'undefined') {
        try {
          setOrgState(JSON.parse(savedOrg));
        } catch (e) {
          console.error('Failed to parse saved organization state:', e);
        }
      }
      // If no savedOrg, orgState stays null → ClientShell redirects to /sign-up

      // Pre-seed projects if none exist (or upgrade older stream-based ones)
      if (savedProjects && !savedProjects.includes('AI Evaluation Layer')) {
        setProjects(JSON.parse(savedProjects));
      } else {
        const defaultProjects: WorkspaceProject[] = [
          {
            id: '6725bdd7',
            name: 'Customer Experience Portal',
            description: 'Modernization of the customer-facing dashboard and self-service account management suite with responsive layouts and real-time support integrations.',
            status: 'Active',
            initials: 'CXP',
          },
          {
            id: '4d1572ca',
            name: 'Multi-Region Cloud Migration',
            description: 'Transition primary database clusters and backend computing engines from single-region systems to AWS multi-region setups with auto-failover and high availability.',
            status: 'Active',
            initials: 'MRCM',
          },
          {
            id: 'e1f1787a',
            name: 'Enterprise CRM Sync Pipeline',
            description: 'Build a secure sync service to harmonize enterprise customer interaction records, marketing funnel data, and contract status between Salesforce and core production databases.',
            status: 'Active',
            initials: 'ECSP',
          }
        ];
        setProjects(defaultProjects);
        localStorage.setItem('smartstream_projects', JSON.stringify(defaultProjects));
      }

      // Hydrate users if previously saved
      if (savedUsers) {
        const VALID_ROLES: WorkspaceUser['role'][] = ['Admin', 'Project Owner', 'Project Manager', 'Team Member'];
        const parsed = JSON.parse(savedUsers) as WorkspaceUser[];
        const migrated = parsed.map(u => {
          // Normalise roles: must be an array of known values
          const rawRoles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role];
          const cleanRoles = rawRoles.filter(r => VALID_ROLES.includes(r as WorkspaceUser['role'])) as WorkspaceUser['role'][];
          const roles = cleanRoles.length > 0 ? cleanRoles : ['Team Member' as const];
          return { ...u, roles, role: roles[0] };
        });
        setUsers(migrated);
      }

      setLoaded(true);
    }
  }, []);

  // Sync back to localStorage whenever state changes
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      if (orgState) {
        localStorage.setItem('smartstream_orgState', JSON.stringify(orgState));
      } else {
        localStorage.removeItem('smartstream_orgState');
      }
    }
  }, [orgState, loaded]);

  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      localStorage.setItem('smartstream_users', JSON.stringify(users));
    }
  }, [users, loaded]);

  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      localStorage.setItem('smartstream_projects', JSON.stringify(projects));
    }
  }, [projects, loaded]);

  // Create organization workspace
  const createWorkspace = (fullName: string, workEmail: string, orgName: string) => {
    const newOrg: OrgState = {
      fullName,
      workEmail,
      orgName,
      createdAt: new Date().toISOString(),
    };
    setOrgState(newOrg);

    // Seed only the new Admin user in the user & role directory, without any assigned projects initially
    const adminId = 'admin-user';
    const newAdmin: WorkspaceUser = {
      id: adminId,
      name: fullName,
      email: workEmail,
      role: 'Admin',
      roles: ['Admin'],
      projects: [], // Admin shouldn't have any assigned project yet since it's a brand new admin user
      status: 'Active',
    };
    
    setUsers([newAdmin]);

    // Auto log in as Admin persona
    setActivePersona('Admin');
  };

  // Update org metadata (editable fields)
  const updateOrgState = (fullName: string, workEmail: string, orgName: string) => {
    setOrgState((prev) => prev ? { ...prev, fullName, workEmail, orgName } : prev);
  };

  // User CRUD
  const inviteUser = (name: string, email: string, rolesList: WorkspaceUser['role'][], projectsList: string[]) => {
    const newUser: WorkspaceUser = {
      id: `emp-${Date.now()}`,
      name,
      email,
      role: rolesList[0] || 'Team Member',
      roles: rolesList,
      projects: projectsList,
      status: 'Pending Invite',
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (
    id: string,
    name: string,
    email: string,
    rolesList: WorkspaceUser['role'][],
    projectsList: string[],
    status: WorkspaceUser['status']
  ) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { 
              ...user, 
              name, 
              email, 
              role: rolesList[0] || 'Team Member', 
              roles: rolesList, 
              projects: projectsList, 
              status 
            }
          : user
      )
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  // Project CRUD
  const createProject = (name: string, description: string, status: WorkspaceProject['status']) => {
    const newProject: WorkspaceProject = {
      id: `proj-${Date.now()}`,
      name,
      description,
      status,
      initials: getInitials(name),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (
    id: string,
    name: string,
    description: string,
    status: WorkspaceProject['status']
  ) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === id
          ? { ...proj, name, description, status, initials: getInitials(name) }
          : proj
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
    // Remove references from users assigned to this project
    setUsers((prev) =>
      prev.map((user) => ({
        ...user,
        projects: user.projects.filter((pId) => pId !== id),
      }))
    );
  };

  // Clear workspace helper (to demo signup flow easily)
  const clearWorkspace = () => {
    setOrgState(null);
    localStorage.removeItem('smartstream_orgState');
    localStorage.removeItem('smartstream_users');
    localStorage.removeItem('smartstream_projects');
    setActivePersona('Project Manager');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <OrgContext.Provider
      value={{
        orgState,
        users,
        projects,
        activeAdminTab,
        setActiveAdminTab,
        createWorkspace,
        updateOrgState,
        inviteUser,
        updateUser,
        deleteUser,
        createProject,
        updateProject,
        deleteProject,
        clearWorkspace,
        loaded,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
