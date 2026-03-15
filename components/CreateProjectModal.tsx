'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Field, 
  FieldLabel, 
  FieldGroup 
} from "@/components/ui/field";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateProject } from '@/lib/mutations';
import { LANGUAGE_CHOICES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchProjects } from '@/lib/queries';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectModal = ({ open, onOpenChange }: CreateProjectModalProps) => {
  const [projectName, setProjectName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const router = useRouter();
  const { user } = useAuth();
  const { data: projectsData } = useFetchProjects();
  
  const createProject = useCreateProject();
  
  const totalProjects = projectsData?.pages[0]?.count || 0;
  const isLimitReached = user?.plan === 'free' && totalProjects >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    createProject.mutate({
      name: projectName,
      language: language,
      file_tree: {
        root: {
          type: "folder",
          children: []
        }
      }
    }, {
      onSuccess: (data: any) => {
        toast.success('Project created successfully!');
        setProjectName('');
        onOpenChange(false);
        if(data && data.slug) {
            router.push(`/editor?project=${data.slug}`)
        }
      },
      onError: (error: any) => {
        console.error('Failed to create project:', error);
        toast.error('Failed to create project. Please try again.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-[#0f172a] border-[#1e293b] text-white p-6 rounded-none">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold tracking-tight">Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isLimitReached ? (
            <div className="bg-tokyo-blue/10 border border-tokyo-blue/20 p-6 text-center space-y-4">
              <Sparkles className="mx-auto text-tokyo-blue size-12" />
              <h3 className="font-bold text-lg">Project Limit Reached</h3>
              <p className="text-sm text-tokyo-fg/70">
                Free users are limited to 3 projects. Upgrade to Pro to create unlimited projects and unlock AI features!
              </p>
              <Button 
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  // Trigger upgrade flow logic? Or just tell them to use the header button.
                  // For now, let's keep it simple and just redirect or notify.
                  toast.info("Click 'Upgrade to Pro' in the header to continue.");
                }}
                className="w-full bg-linear-to-r from-tokyo-blue to-purple-500 text-white font-bold h-11 rounded-none"
              >
                Upgrade Now
              </Button>
            </div>
          ) : (
            <>
              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel className="text-sm font-semibold text-tokyo-fg mb-2">Project Name</FieldLabel>
                  <Input
                    id="name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. My Awesome Startup"
                    className="bg-[#1e293b]/50 border-[#334155] focus:border-tokyo-blue/50 text-white placeholder:text-tokyo-muted rounded-none h-11"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-sm font-semibold text-tokyo-fg mb-2">Framework / Language</FieldLabel>
                  <Select value={language} onValueChange={setLanguage} required>
                    <SelectTrigger className="bg-[#1e293b]/50 border-[#334155] focus:ring-0 focus:ring-offset-0 focus:border-tokyo-blue/50 text-white rounded-none h-11">
                      <SelectValue placeholder="Select a framework" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-[#334155] text-white rounded-none max-h-[300px]">
                      {LANGUAGE_CHOICES.map((choice) => (
                        <SelectItem 
                          key={choice.value} 
                          value={choice.value}
                          className="rounded-none focus:bg-tokyo-blue focus:text-white"
                        >
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <Button 
                type="submit" 
                disabled={createProject.isPending}
                className="w-full bg-tokyo-blue hover:bg-tokyo-blue/90 text-white font-bold h-11 rounded-none shadow-lg shadow-tokyo-blue/20 flex items-center justify-center gap-2 mt-4"
              >
                {createProject.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                Create Project
              </Button>
            </>
          )}

          <p className="text-center text-[11px] text-tokyo-muted mt-4">
            By creating a project, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a>.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
