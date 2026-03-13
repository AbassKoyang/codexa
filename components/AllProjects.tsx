'use client';

import React from 'react';
import { FileText, MoreHorizontal, LayoutGrid, List, Loader2 } from 'lucide-react';
import { useFetchProjects } from '@/lib/queries';

const AllProjects = () => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    isError 
  } = useFetchProjects();

  const projects = data?.pages.flatMap(page => page.results) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-tokyo-blue animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-400/10 rounded-xl border border-red-400/20">
        Failed to load projects.
      </div>
    );
  }

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
        {projects.map((project) => (
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
                Updated {new Date(project.lastEdited).toLocaleDateString()} • <span className="text-[#414868]">{project.branch || 'main'}</span>
              </p>
            </div>
            
            <button className="p-2 text-tokyo-muted hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-[#24283b] hover:bg-[#2d334a] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-tokyo-muted italic">No projects found. Create your first one!</p>
        </div>
      )}
    </section>
  );
};

export default AllProjects;
