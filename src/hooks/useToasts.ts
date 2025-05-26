
import { useEffect } from 'react';
import { isToday, isTomorrow } from 'date-fns';
import { Task } from '../types/task';
import { flattenTasks } from '../utils/taskUtils';
import { toast } from '../hooks/use-toast';

export const useTaskNotifications = (tasks: Task[]) => {
  useEffect(() => {
    const allTasks = flattenTasks(tasks);
    const incompleteTasks = allTasks.filter(task => !task.completed && task.dueDate);
    
    const tasksToday = incompleteTasks.filter(task => 
      task.dueDate && isToday(task.dueDate)
    );
    
    const tasksTomorrow = incompleteTasks.filter(task => 
      task.dueDate && isTomorrow(task.dueDate)
    );
    
    // Show notifications for tasks due today
    if (tasksToday.length > 0) {
      toast({
        title: `${tasksToday.length} task${tasksToday.length > 1 ? 's' : ''} due today!`,
        description: tasksToday.slice(0, 3).map(task => task.title).join(', ') + 
                    (tasksToday.length > 3 ? ` and ${tasksToday.length - 3} more` : ''),
        duration: 5000,
      });
    }
    
    // Show notifications for tasks due tomorrow
    if (tasksTomorrow.length > 0) {
      toast({
        title: `${tasksTomorrow.length} task${tasksTomorrow.length > 1 ? 's' : ''} due tomorrow`,
        description: tasksTomorrow.slice(0, 3).map(task => task.title).join(', ') + 
                    (tasksTomorrow.length > 3 ? ` and ${tasksTomorrow.length - 3} more` : ''),
        duration: 4000,
      });
    }
  }, [tasks]);
};
