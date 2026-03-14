import { useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUpdateProject } from './mutations';
import { useFileTree } from '@/contexts/FileTreeContext';

export const useProjectSave = () => {
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');
  const updateProject = useUpdateProject();
  const { setSaveStatus } = useFileTree();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const saveTree = useCallback((newTree: any) => {
    if (!projectSlug) return;
    setSaveStatus('saving');

    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

    // Minor debounce so multiple rapid create/deletes don't spark 10 backend requests immediately
    timeoutIdRef.current = setTimeout(() => {
      updateProject.mutate({
        slug: projectSlug,
        data: {
          file_tree: {
            root: {
              type: "folder",
              children: newTree
            }
          }
        }
      }, {
        onSuccess: () => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 2000);
        },
        onError: (error: any) => {
          console.error("Autosave failed", error);
          setSaveStatus('error');
        }
      });
    }, 500); 
  }, [projectSlug, updateProject, setSaveStatus]);

  return saveTree;
};
