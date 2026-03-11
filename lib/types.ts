import z from "zod";
import { userSchema } from "./schema";

export type User = z.infer<typeof userSchema>

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
