
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Task } from '../types/task';
import { flattenTasks, getUrgencyLevel } from '../utils/taskUtils';
import { Button } from './ui/button';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick, onAddTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const allTasks = flattenTasks(tasks);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getTasksForDate = (date: Date) => {
    return allTasks.filter(task => 
      task.dueDate && isSameDay(task.dueDate, date) && !task.completed
    );
  };

  const urgencyColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map(date => {
            const tasksForDate = getTasksForDate(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[100px] p-2 border rounded-lg transition-colors hover:bg-gray-50 ${
                  isCurrentDay ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  <button
                    onClick={() => onAddTask(date)}
                    className="opacity-0 hover:opacity-100 p-1 hover:bg-white rounded transition-all"
                    title="Add task"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {tasksForDate.slice(0, 3).map(task => {
                    const urgencyLevel = getUrgencyLevel(task);
                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`p-1 text-xs rounded cursor-pointer text-white truncate ${urgencyColors[urgencyLevel]}`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                  {tasksForDate.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{tasksForDate.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
