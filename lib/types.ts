import z from "zod";
import { userSchema } from "./schema";

export type User = z.infer<typeof userSchema>

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ProjectStatus = 'production' | 'development' | 'archived' | 'preview';

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  updated_at: string;
  created_at: string;
  language: string;
  status: ProjectStatus;
  thumbnail?: string;
  file_tree?: any;
}

export interface Message {
  id: string | number;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
}

export interface Results<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
