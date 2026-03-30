'use client';

import React from 'react';
import { MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { useFetchProjects } from '@/lib/queries';
import { useDeleteProject } from '@/lib/mutations';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const RecentProjects = () => {
  const { data, isLoading, isError } = useFetchProjects();
  const router = useRouter();
  const deleteProjectMutation = useDeleteProject();

  const projects = data?.pages.flatMap(page => page.results).slice(0, 3) || [];

  if (isLoading) {
    return (
      <section>
        <div className="flex flex-col gap-1 mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#1E293B] border border-[#414868]/30 rounded-none overflow-hidden h-64">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-5">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
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
      </div>
    </section>
  );
};

export default RecentProjects;
