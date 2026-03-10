import { useQuery } from "@tanstack/react-query"
import { fetchSessionUser } from "./api"

export const useFetchSessionUser = () => {
    return useQuery({
        queryFn: () => fetchSessionUser(),
        queryKey: ['session-user']
    })
}