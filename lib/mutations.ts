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
            await queryClient.cancelQueries({ queryKey: ['projects'] });

            const previousProjects = queryClient.getQueryData(['projects']);

            const optimisticProject = { 
                ...newProject, 
                id: 'temp-' + Date.now(), 
                slug: newProject.name.toLowerCase().replace(/ /g, '-'),
                is_deleted: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as any;

            queryClient.setQueryData(['projects'], (old: any) => {
                if (!old) return old;

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

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ slug, data }: { slug: string, data: Partial<Project> }) => {
            const response = await api.patch(`/api/projects/${slug}/`, data);
            return response.data as Project;
        },
        onSuccess: (data) => {
             queryClient.invalidateQueries({ queryKey: ['project', data.slug] });
             queryClient.invalidateQueries({ queryKey: ['projects'] });
             queryClient.invalidateQueries({ queryKey: ['recent-projects'] });
        }
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (slug: string) => {
            await api.delete(`/api/projects/${slug}/`);
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['projects'] });
             queryClient.invalidateQueries({ queryKey: ['recent-projects'] });
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number, data: any }) => {
            const response = await api.patch(`/api/users/${id}/update/`, data);
            return response.data as any;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['session-user'] });
            const previousUser = queryClient.getQueryData(['session-user']);

            queryClient.setQueryData(['session-user'], (old: any) => {
                if (!old) return old;
                return { ...old, ...variables.data };
            });

            return { previousUser };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['session-user'], context?.previousUser);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['session-user'] });
        }
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/users/${id}/delete/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['session-user'] });
        }
    });
};
