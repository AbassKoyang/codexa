import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { api } from "./api";
import { Project, PaginatedResponse } from "./types";

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; language: string; file_tree?: any; thumbnail?: string }) => {
            const response = await api.post('/api/projects/', data);
            return response.data as Project;
        },
        onMutate: async (newProject) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['projects'] });

            // Snapshot the previous value
            const previousProjects = queryClient.getQueryData(['projects']);

            const optimisticProject = { 
                ...newProject, 
                id: 'temp-' + Date.now(), 
                slug: newProject.name.toLowerCase().replace(/ /g, '-'),
                is_deleted: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as any;

            // Optimistically update to the new value
            queryClient.setQueryData(['projects'], (old: any) => {
                if (!old) return old;

                // Handle InfiniteData structure (used by useFetchProjects)
                if (old.pages && Array.isArray(old.pages)) {
                    return {
                        ...old,
                        pages: old.pages.map((page: any, index: number) => 
                            index === 0 
                                ? { ...page, results: [optimisticProject, ...page.results] } 
                                : page
                        )
                    };
                }

                // Fallback for simple array structure
                if (Array.isArray(old)) {
                    return [optimisticProject, ...old];
                }

                return old;
            });

            return { previousProjects };
        },
        onError: (err, newProject, context) => {
            queryClient.setQueryData(['projects'], context?.previousProjects);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['recent-projects'] });
        }
    });
};
