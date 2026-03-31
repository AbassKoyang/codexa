'use client';

import React from 'react';
import { FileText, MoreHorizontal, LayoutGrid, List, Loader2, Trash2 } from 'lucide-react';
import { useFetchProjects } from '@/lib/queries';
import { useDeleteProject } from '@/lib/mutations';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const AllProjects = () => {
  const router = useRouter();
  const [view, setView] = useState<'grid' | 'list'>('list');
  const deleteProjectMutation = useDeleteProject();
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
      <section>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-20" />
        </div>
        {view === 'list' && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#1E293B] p-4 border border-[#414868]/30">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}
        {view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1E293B] border border-[#414868]/30 rounded-none h-64">
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="p-5">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-400/10 border border-red-400/20">
        Failed to load projects.
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">All Projects</h2>
        <div className="flex items-center gap-2 p-1 bg-[#1a1b26] rounded-none border border-[#414868]/30">
          <button onClick={() => setView('grid')} className={`cursor-pointer p-1.5 rounded-none ${view == 'grid' ? 'bg-[#24283b] text-tokyo-blue shadow-sm' : 'text-tokyo-muted hover:text-white transition-colors'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setView('list')} className={`cursor-pointer p-1.5 rounded-none ${view == 'list' ? 'bg-[#24283b] text-tokyo-blue shadow-sm' : 'text-tokyo-muted hover:text-white transition-colors'}`}>
            <List size={18} />
          </button>
        </div>
      </div>
      
      {view == 'list' && <div className="space-y-3">
        {projects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => router.push(`/editor?project=${project.slug}`)}
            className="flex items-center gap-4 bg-[#1E293B] p-4 border border-[#414868]/30 hover:border-tokyo-blue/50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-tokyo-blue/10 flex items-center justify-center text-tokyo-blue group-hover:bg-tokyo-blue group-hover:text-white transition-all">
              <FileText size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-tokyo-blue transition-colors">{project.name}</h3>
              <p className="text-[10px] sm:text-xs text-tokyo-muted mt-0.5">
                Updated {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(project.updated_at))}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button onClick={(e) => e.stopPropagation()} className="p-2 text-tokyo-muted hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end" className="w-50 bg-tokyo-bg border-tokyo-border text-tokyo-fg z-50 rounded-none flex items-center justify-center">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("Are you sure you want to delete this project?")) {
                      deleteProjectMutation.mutate(project.slug, {
                         onSuccess: () => toast.success("Project deleted")
                      })
                    }
                  }}
                  className="w-full hover:bg-tokyo-hover focus:bg-tokyo-hover cursor-pointer text-sm text-red-400 focus:text-red-400 rounded-none"
                >
                  <Trash2 className="w-4 h-4 mr-2 text-red-400 focus:text-red-400" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>}

      {view == 'grid' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="flex flex-col min-w-0 pr-2">
                  <h3 className="font-bold text-white group-hover:text-tokyo-blue transition-colors truncate">{project.name}</h3>
                  <span className="text-[10px] font-black bg-[#24283b] text-tokyo-muted w-fit px-2 py-0.5 rounded uppercase tracking-widest border border-[#414868]/30 mt-1">
                    {project.language || 'GENERAL'}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button onClick={(e) => e.stopPropagation()} className="p-1 text-tokyo-muted hover:text-white transition-colors shrink-0 z-10">
                      <MoreHorizontal size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end" className="w-40 bg-tokyo-bg border-tokyo-border text-tokyo-fg z-50">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm("Are you sure you want to delete this project?")) {
                          deleteProjectMutation.mutate(project.slug, {
                             onSuccess: () => toast.success("Project deleted")
                          })
                        }
                      }}
                      className="hover:bg-tokyo-hover focus:bg-tokyo-hover cursor-pointer text-sm text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-xs text-tokyo-muted">Edited  {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(project.updated_at))}</p>
            </div>
          </div>
        ))}
      </div>}

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
