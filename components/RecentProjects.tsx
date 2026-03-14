'use client';

import React from 'react';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { useFetchProjects } from '@/lib/queries';
import { useRouter } from 'next/navigation';

const RecentProjects = () => {
  const { data, isLoading, isError } = useFetchProjects();
  const router = useRouter();

  const projects = data?.pages.flatMap(page => page.results).slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-tokyo-blue animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-400/10 border border-red-400/20">
        Failed to load recent projects.
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Recent Projects</h2>
        <p className="text-sm text-tokyo-muted">Pick up where you left off</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id}
            onClick={() => router.push(`/editor?project=${project.slug}`)} 
            className="group bg-[#1E293B] border border-[#414868]/30 rounded-none overflow-hidden hover:border-tokyo-blue/50 transition-all duration-300 hover:shadow-2xl hover:shadow-tokyo-blue/5 cursor-pointer"
          >
            <div className="aspect-video relative overflow-hidden bg-[#24283b]">
              {project.thumbnail ? (
                <img 
                  src={project.thumbnail} 
                  alt={project.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-tokyo-muted bg-[#1e293b]">
                  No Preview
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-[#1a1b26] via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white group-hover:text-tokyo-blue transition-colors truncate">{project.name}</h3>
                <span className="text-[10px] font-black bg-[#24283b] text-tokyo-muted px-2 py-0.5 rounded uppercase tracking-widest border border-[#414868]/30">
                  {project.framework || 'GENERAL'}
                </span>
              </div>
              <p className="text-xs text-tokyo-muted">Edited {new Date(project.lastEdited).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentProjects;
