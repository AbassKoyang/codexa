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
  description?: string;
  lastEdited: string;
  framework: string;
  status: ProjectStatus;
  branch: string;
  thumbnail?: string;
}
