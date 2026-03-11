'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

const MOCK_RECENT_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'E-commerce App',
    lastEdited: '2h ago',
    framework: 'REACT',
    status: 'development',
    branch: 'main',
    thumbnail: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=250&fit=crop'
  },
  {
    id: '2',
    name: 'Portfolio Website',
    lastEdited: '5h ago',
    framework: 'NEXT.JS',
    status: 'production',
    branch: 'main',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop'
  },
  {
    id: '3',
    name: 'Internal Tooling',
    lastEdited: '1d ago',
    framework: 'PYTHON',
    status: 'development',
    branch: 'main',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop'
  }
];

const RecentProjects = () => {
  return (
    <section>
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Recent Projects</h2>
        <p className="text-sm text-tokyo-muted">Pick up where you left off</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_RECENT_PROJECTS.map((project) => (
          <div 
            key={project.id} 
            className="group bg-[#1E293B] border border-[#414868]/30 rounded-none overflow-hidden hover:border-tokyo-blue/50 transition-all duration-300 hover:shadow-2xl hover:shadow-tokyo-blue/5 cursor-pointer"
          >
            <div className="aspect-video relative overflow-hidden bg-[#24283b]">
              {project.thumbnail && (
                <img 
                  src={project.thumbnail} 
                  alt={project.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-[#1a1b26] via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white group-hover:text-tokyo-blue transition-colors truncate">{project.name}</h3>
                <span className="text-[10px] font-black bg-[#24283b] text-tokyo-muted px-2 py-0.5 rounded uppercase tracking-widest border border-[#414868]/30">
                  {project.framework}
                </span>
              </div>
              <p className="text-xs text-tokyo-muted">Edited {project.lastEdited}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentProjects;
