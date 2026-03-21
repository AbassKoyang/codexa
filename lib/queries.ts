import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { fetchHistory, fetchProject, fetchProjects, fetchSessionUser } from "./api"
import { Project, PaginatedResponse, Message } from "./types"

export const useFetchSessionUser = () => {
    return useQuery({
        queryFn: () => fetchSessionUser(),
        queryKey: ['session-user']
    })
}

export const useFetchProjects = () => {
    return useInfiniteQuery({
        queryFn: ({ pageParam = 1 }) => fetchProjects(pageParam),
        queryKey: ['projects'],
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage.next) return undefined
    
            const url = new URL(String(lastPage.next))
            return Number(url.searchParams.get('page'))
        }
    })
}

export const useFetchProject = (slug?: string) => {
    return useQuery({
        queryFn: () => fetchProject(slug!),
        queryKey: ['project', slug],
        enabled: !!slug
    })
}

export const useFetchHistory = (slug?: string) => {
    return useQuery({
        queryFn: () => fetchHistory(slug!),
        queryKey: ['history', slug],
        enabled: !!slug
    })
}