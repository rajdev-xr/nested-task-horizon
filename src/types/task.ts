
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  weight: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  parentId: string | null;
  subtasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  order: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export type ViewMode = 'list' | 'calendar';

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: Date | null;
  weight: 1 | 2 | 3 | 4 | 5;
  parentId?: string | null;
}
