'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { FileText, MoreHorizontal, LayoutGrid, List } from 'lucide-react';

const MOCK_ALL_PROJECTS: Project[] = [
  {
    id: '4',
    name: 'documentation-site',
    lastEdited: '3 days ago',
    framework: 'MARKDOWN',
    status: 'production',
    branch: 'main branch'
  },
  {
    id: '5',
    name: 'rest-api-service',
    lastEdited: '1 week ago',
    framework: 'GO',
    status: 'production',
    branch: 'production'
  }
];

const AllProjects = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">All Projects</h2>
        <div className="flex items-center gap-2 p-1 bg-[#1a1b26] rounded-none border border-[#414868]/30">
          <button className="p-1.5 rounded-none text-tokyo-muted hover:text-white transition-colors">
            <LayoutGrid size={18} />
          </button>
          <button className="p-1.5 rounded-none bg-[#24283b] text-tokyo-blue shadow-sm">
            <List size={18} />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {MOCK_ALL_PROJECTS.map((project) => (
          <div 
            key={project.id} 
            className="flex items-center gap-4 bg-[#1E293B] p-4 border border-[#414868]/30 hover:border-tokyo-blue/50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-tokyo-blue/10 flex items-center justify-center text-tokyo-blue group-hover:bg-tokyo-blue group-hover:text-white transition-all">
              <FileText size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate group-hover:text-tokyo-blue transition-colors">{project.name}</h3>
              <p className="text-xs text-tokyo-muted mt-0.5">
                Updated {project.lastEdited} • <span className="text-[#414868]">{project.branch}</span>
              </p>
            </div>
            
            <button className="p-2 text-tokyo-muted hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AllProjects;
