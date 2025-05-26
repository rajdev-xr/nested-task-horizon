
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
  weight: dbTask.weight,
  completed: dbTask.completed,
  parentId: dbTask.parent_task_id,
  subtasks: [],
  createdAt: new Date(dbTask.created_at),
  updatedAt: new Date(dbTask.updated_at),
  userId: dbTask.user_id,
  order: dbTask.order_position,
});

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
      setTasks(convertedTasks);
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
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.dueDate?.toISOString() || null,
          weight: taskData.weight,
          parent_task_id: parentId || taskData.parentId || null,
          order_position: tasks.length,
        }])
        .select()
        .single();

      if (error) throw error;

      const newTask = convertDatabaseTaskToTask(data);
      setTasks(prev => [...prev, newTask]);
      
      toast({
        title: "Task created successfully!",
        description: `"${taskData.title}" has been added to your task list.`,
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

      const updatedTask = convertDatabaseTaskToTask(data);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
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
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
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
    const task = tasks.find(t => t.id === taskId);
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId && t.parentId !== taskId));
      
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

      // Update local state
      setTasks(prev => prev.map(task => {
        const newIndex = taskIds.indexOf(task.id);
        return newIndex !== -1 ? { ...task, order: newIndex } : task;
      }));
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
