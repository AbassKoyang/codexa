"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useFetchProjects } from "@/lib/queries";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectSearchModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProjectSearchModal({ open, setOpen }: ProjectSearchModalProps) {
  const router = useRouter();
  const { data, isLoading } = useFetchProjects();
  const projects = data?.pages.flatMap((page) => page.results) || [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const onSelect = (slug: string) => {
    setOpen(false);
    router.push(`/editor?project=${slug}`);
  };

  return (
    <CommandDialog className="bg-tokyo-bg rounded-none" open={open} onOpenChange={setOpen}>
      <Command className="bg-tokyo-bg rounded-none">
        <CommandInput className="rounded-[0px]" placeholder="Search projects..." />
        <CommandList>
          {!isLoading && <CommandEmpty>No projects found.</CommandEmpty>}
          <CommandGroup heading="Your Projects">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-2">
                  <Skeleton className="w-5 h-5 rounded-sm shrink-0 bg-tokyo-muted/20" />
                  <div className="flex flex-col gap-1 w-full">
                    <Skeleton className="h-3 w-1/3 bg-tokyo-muted/20" />
                    <Skeleton className="h-2 w-1/4 bg-tokyo-muted/10" />
                  </div>
                </div>
              ))
            ) : projects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.name}
                onSelect={() => onSelect(project.slug)}
                className="flex items-center gap-3 cursor-pointer py-2 rounded-[0px] bg-tokyo-bg group hover:bg-[#3C83F6]/10"
              >
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.name} className="w-5 h-5 object-contain" />
                ) : (
                  <div className="w-5 h-5 bg-tokyo-bg border border-[#414868]/30 flex items-center justify-center text-[10px] text-tokyo-muted rounded-sm">
                    {project.language ? project.language.substring(0, 2).toUpperCase() : '?'}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-tokyo-fg group-hover:text-tokyo-blue">{project.name}</span>
                  <span className="text-xs text-tokyo-blue uppercase tracking-widest mt-0.5">{project.language || 'General'}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
