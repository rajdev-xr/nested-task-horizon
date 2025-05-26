
import { differenceInDays, startOfDay } from 'date-fns';
import { Task } from '../types/task';

export const calculatePriority = (task: Task): number => {
  if (!task.dueDate || task.completed) return 0;
  
  const today = startOfDay(new Date());
  const dueDate = startOfDay(task.dueDate);
  const daysLeft = differenceInDays(dueDate, today);
  
  // Avoid division by zero and handle overdue tasks
  if (daysLeft <= 0) return task.weight * 100; // Very high priority for overdue/today
  
  return task.weight / daysLeft;
};

export const getUrgencyLevel = (task: Task): 'critical' | 'high' | 'medium' | 'low' => {
  const priority = calculatePriority(task);
  
  if (priority >= 5) return 'critical';
  if (priority >= 3) return 'high';
  if (priority >= 1) return 'medium';
  return 'low';
};

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => calculatePriority(b) - calculatePriority(a));
};

export const getTopUrgentTasks = (tasks: Task[], count: number = 5): Task[] => {
  const allTasks = flattenTasks(tasks);
  const incompleteTasks = allTasks.filter(task => !task.completed);
  const sortedTasks = sortTasksByPriority(incompleteTasks);
  return sortedTasks.slice(0, count);
};

export const flattenTasks = (tasks: Task[]): Task[] => {
  const result: Task[] = [];
  
  const flatten = (taskList: Task[]) => {
    taskList.forEach(task => {
      result.push(task);
      if (task.subtasks && task.subtasks.length > 0) {
        flatten(task.subtasks);
      }
    });
  };
  
  flatten(tasks);
  return result;
};

export const buildTaskHierarchy = (tasks: Task[]): Task[] => {
  const taskMap = new Map<string, Task>();
  const rootTasks: Task[] = [];
  
  // Initialize all tasks with empty subtasks array
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, subtasks: [] });
  });
  
  // Build hierarchy
  tasks.forEach(task => {
    const currentTask = taskMap.get(task.id)!;
    
    if (task.parentId) {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.subtasks.push(currentTask);
      } else {
        rootTasks.push(currentTask);
      }
    } else {
      rootTasks.push(currentTask);
    }
  });
  
  return rootTasks;
};
