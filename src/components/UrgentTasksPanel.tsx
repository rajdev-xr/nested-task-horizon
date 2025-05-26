
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Task } from '../types/task';
import { getTopUrgentTasks, getUrgencyLevel } from '../utils/taskUtils';
import { format } from 'date-fns';

interface UrgentTasksPanelProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const UrgentTasksPanel: React.FC<UrgentTasksPanelProps> = ({ tasks, onTaskClick }) => {
  const urgentTasks = getTopUrgentTasks(tasks, 5);

  if (urgentTasks.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center text-green-700">
          <Clock className="w-5 h-5 mr-2" />
          <span className="font-medium">All caught up! No urgent tasks.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
        <h3 className="font-semibold text-red-900">Top 5 Urgent Tasks</h3>
      </div>
      
      <div className="space-y-2">
        {urgentTasks.map((task, index) => {
          const urgencyLevel = getUrgencyLevel(task);
          const urgencyColors = {
            critical: 'bg-red-100 border-red-300 text-red-900',
            high: 'bg-orange-100 border-orange-300 text-orange-900',
            medium: 'bg-yellow-100 border-yellow-300 text-yellow-900',
            low: 'bg-green-100 border-green-300 text-green-900'
          };
          
          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={`p-3 rounded border cursor-pointer transition-all hover:shadow-sm ${urgencyColors[urgencyLevel]}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">#{index + 1}</span>
                    <span className="font-medium">{task.title}</span>
                  </div>
                  {task.dueDate && (
                    <div className="text-xs opacity-75 mt-1">
                      Due: {format(task.dueDate, 'MMM dd')}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">Weight: {task.weight}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UrgentTasksPanel;
