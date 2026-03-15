import axios from "axios";
import { User, Project, PaginatedResponse } from "./types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
        
  const AUTH_ENDPOINTS = [
    "/api/auth/login/",
    "/api/auth/register/",
    "/api/auth/refresh/",
    "/api/auth/password-reset/",
    "/api/auth/password-reset/confirm/",
    // "/api/auth/me/",
  ];
        
  let isRefreshing = false;
  let refreshSubscribers: (() => void)[] = [];
  
  function subscribeTokenRefresh(cb: () => void) {
    refreshSubscribers.push(cb);
  }
  
  function onRefreshed() {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
  }
        
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest = AUTH_ENDPOINTS.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (    
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        await api.post("/api/auth/refresh/");

        isRefreshing = false;
        onRefreshed();

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const fetchSessionUser = async () : Promise<User> => {
      try {
        const response =  await api.get(`/api/auth/me/`, {withCredentials: true})
        console.log(response.data)
        return response.data as User
    } catch (error) {
        console.error("error fetching user", error)
        throw error
    }
}

export const fetchProjects = async (page: number) : Promise<PaginatedResponse<Project>> => {
  try {
    const response =  await api.get(`/api/projects/?page=${page}`)
    console.log(response.data)
    return response.data as PaginatedResponse<Project>
} catch (error) {
    console.error("error fetching projects", error)
    throw error
}}

export const fetchProject = async (slug: string) : Promise<Project> => {
    try {
      const response = await api.get(`/api/projects/${slug}/`)
      return response.data as Project
  } catch (error) {
      console.error("error fetching project", error)
      throw error
  }
}

export const updateProject = async (slug: string, data: Partial<Project>) : Promise<Project> => {
    try {
        const response = await api.patch(`/api/projects/${slug}/`, data);
        return response.data as Project;
    } catch (error) {
        console.error("error updating project", error);
        throw error;
    }
}

export const initializeSubscription = async (amount?: number) => {
  try {
    const response = await api.post("/api/subscriptions/initialize/", { amount });
    return response.data;
  } catch (error) {
    console.error("Error initializing subscription", error);
    throw error;
  }
};