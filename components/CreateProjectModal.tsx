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
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectModal = ({ open, onOpenChange }: CreateProjectModalProps) => {
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating project:', { name: projectName, framework });
    // TODO: Implement backend integration
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-[#0f172a] border-[#1e293b] text-white p-6 rounded-none">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold tracking-tight">Create New Project</DialogTitle>
          {/* <DialogClose className="rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-tokyo-muted">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose> */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Select value={framework} onValueChange={setFramework} required>
                <SelectTrigger className="bg-[#1e293b]/50 border-[#334155] focus:ring-0 focus:ring-offset-0 focus:border-tokyo-blue/50 text-white rounded-none h-11">
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155] text-white rounded-none">
                  <SelectItem className="rounded-none" value="nextjs">Next.js</SelectItem>
                  <SelectItem className="rounded-none" value="react">React</SelectItem>
                  <SelectItem className="rounded-none" value="python">Python</SelectItem>
                  <SelectItem className="rounded-none" value="go">Go</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <Button 
            type="submit" 
            className="w-full bg-tokyo-blue hover:bg-tokyo-blue/90 text-white font-bold h-11 rounded-none shadow-lg shadow-tokyo-blue/20 flex items-center justify-center gap-2 mt-4"
          >
            <Plus size={18} />
            Create Project
          </Button>

          <p className="text-center text-[11px] text-tokyo-muted mt-4">
            By creating a project, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a>.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
