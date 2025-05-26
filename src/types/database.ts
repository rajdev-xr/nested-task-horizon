
export interface DatabaseTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  weight: number; // Changed from union type to number since DB returns number
  parent_task_id: string | null;
  completed: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskWithPriority extends DatabaseTask {
  priority_score: number;
  level?: number;
  path?: string;
}
