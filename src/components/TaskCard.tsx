
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronDown, ChevronRight, MoreHorizontal, Plus } from 'lucide-react';
import { Task } from '../types/task';
import { calculatePriority, getUrgencyLevel } from '../utils/taskUtils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  level?: number;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string) => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  level = 0,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddSubtask,
  isDragging = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  
  const urgencyLevel = getUrgencyLevel(task);
  const priority = calculatePriority(task);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  
  const urgencyColors = {
    critical: 'border-l-red-500 bg-red-50',
    high: 'border-l-orange-500 bg-orange-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-green-500 bg-green-50'
  };
  
  const weightColors = {
    1: 'bg-gray-100 text-gray-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-orange-100 text-orange-800',
    5: 'bg-red-100 text-red-800'
  };

  return (
    <div className={cn(
      "transition-all duration-200",
      level > 0 && "ml-6 mt-2"
    )}>
      <div className={cn(
        "group border-l-4 rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md",
        urgencyColors[urgencyLevel],
        isDragging && "opacity-50 scale-95",
        task.completed && "opacity-60"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {hasSubtasks && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 p-1 hover:bg-white/50 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={cn(
                  "font-medium text-gray-900",
                  task.completed && "line-through text-gray-500"
                )}>
                  {task.title}
                </h3>
                <Badge variant="secondary" className={weightColors[task.weight]}>
                  W{task.weight}
                </Badge>
                {priority > 0 && (
                  <Badge variant="outline" className="text-xs">
                    P: {priority.toFixed(1)}
                  </Badge>
                )}
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              )}
              
              {task.dueDate && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(task.dueDate, 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddSubtask(task.id)}
              className="p-1 h-7 w-7"
            >
              <Plus className="w-3 h-3" />
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 h-7 w-7"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg border z-10 py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit(task);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(task.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {hasSubtasks && isExpanded && (
        <div className="mt-2 space-y-2">
          {task.subtasks.map(subtask => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              level={level + 1}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
