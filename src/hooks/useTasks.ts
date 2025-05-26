
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFormData } from '../types/task';
import { DatabaseTask, TaskWithPriority } from '../types/database';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

const convertDatabaseTaskToTask = (dbTask: DatabaseTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || '',
  dueDate: dbTask.due_date ? new Date(dbTask.due_date) : null,
  weight: Math.min(Math.max(dbTask.weight, 1), 5) as 1 | 2 | 3 | 4 | 5,
  completed: dbTask.completed,
  parentId: dbTask.parent_task_id,
  subtasks: [],
  createdAt: new Date(dbTask.created_at),
  updatedAt: new Date(dbTask.updated_at),
  userId: dbTask.user_id,
  order: dbTask.order_position,
});

const buildHierarchy = (tasks: Task[]): Task[] => {
  const taskMap = new Map<string, Task>();
  const rootTasks: Task[] = [];

  // First pass: create all tasks and put them in the map
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, subtasks: [] });
  });

  // Second pass: build the hierarchy
  tasks.forEach(task => {
    const taskWithSubtasks = taskMap.get(task.id)!;
    
    if (task.parentId) {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.subtasks.push(taskWithSubtasks);
      }
    } else {
      rootTasks.push(taskWithSubtasks);
    }
  });

  return rootTasks;
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order_position');

      if (error) throw error;

      const convertedTasks = data.map(convertDatabaseTaskToTask);
      const hierarchicalTasks = buildHierarchy(convertedTasks);
      setTasks(hierarchicalTasks);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskFormData, parentId?: string | null) => {
    if (!user) return;

    try {
      // If creating a subtask, inherit parent's due date and weight if not specified
      let inheritedData = { ...taskData };
      
      if (parentId) {
        // Find parent task to inherit properties
        const findParentTask = (tasks: Task[]): Task | null => {
          for (const task of tasks) {
            if (task.id === parentId) return task;
            const found = findParentTask(task.subtasks);
            if (found) return found;
          }
          return null;
        };
        
        const parentTask = findParentTask(tasks);
        if (parentTask) {
          inheritedData = {
            ...taskData,
            dueDate: taskData.dueDate || parentTask.dueDate,
            weight: taskData.weight || parentTask.weight,
          };
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: inheritedData.title,
          description: inheritedData.description || null,
          due_date: inheritedData.dueDate?.toISOString() || null,
          weight: inheritedData.weight,
          parent_task_id: parentId || null,
          order_position: 0, // Will be handled by reordering
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh tasks to get updated hierarchy
      await fetchTasks();
      
      toast({
        title: "Task created successfully!",
        description: `"${inheritedData.title}" has been added${parentId ? ' as a subtask' : ''}.`,
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (taskId: string, taskData: TaskFormData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.dueDate?.toISOString() || null,
          weight: taskData.weight,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      await fetchTasks();
      
      toast({
        title: "Task updated successfully!",
        description: `"${taskData.title}" has been updated.`,
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    if (!user) return;

    try {
      // Find the task in the hierarchy
      const findTask = (tasks: Task[]): Task | null => {
        for (const task of tasks) {
          if (task.id === taskId) return task;
          const found = findTask(task.subtasks);
          if (found) return found;
        }
        return null;
      };
      
      const task = findTask(tasks);
      if (!task) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId);

      if (error) throw error;

      // Check if we should auto-complete parent when all subtasks are done
      if (!task.completed && task.parentId) {
        const parentTask = findTask(tasks);
        if (parentTask) {
          const allSubtasksCompleted = parentTask.subtasks.every(subtask => 
            subtask.id === taskId || subtask.completed
          );
          
          if (allSubtasksCompleted) {
            await supabase
              .from('tasks')
              .update({ completed: true })
              .eq('id', task.parentId);
          }
        }
      }

      await fetchTasks();
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      // Find the task in the hierarchy
      const findTask = (tasks: Task[]): Task | null => {
        for (const task of tasks) {
          if (task.id === taskId) return task;
          const found = findTask(task.subtasks);
          if (found) return found;
        }
        return null;
      };
      
      const task = findTask(tasks);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      
      if (task) {
        toast({
          title: "Task deleted",
          description: `"${task.title}" has been removed.`,
        });
      }
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const reorderTasks = async (taskIds: string[]) => {
    if (!user) return;

    try {
      const updates = taskIds.map((id, index) => ({
        id,
        order_position: index,
      }));

      for (const update of updates) {
        await supabase
          .from('tasks')
          .update({ order_position: update.order_position })
          .eq('id', update.id);
      }

      await fetchTasks();
    } catch (error: any) {
      console.error('Error reordering tasks:', error);
      toast({
        title: "Error",
        description: "Failed to reorder tasks",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    reorderTasks,
    refetch: fetchTasks,
  };
};
