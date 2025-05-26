
import React, { useState, useEffect } from 'react';
import { Plus, List, Calendar as CalendarIcon, Settings, LogOut } from 'lucide-react';
import { ViewMode, Task, TaskFormData } from '../types/task';
import { buildTaskHierarchy, sortTasksByPriority } from '../utils/taskUtils';
import { mockTasks } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TaskFormModal from '../components/TaskFormModal';
import UrgentTasksPanel from '../components/UrgentTasksPanel';
import CalendarView from '../components/CalendarView';
import DraggableTaskList from '../components/DraggableTaskList';
import { useTaskNotifications } from '../hooks/useToasts';
import { toast } from '../hooks/use-toast';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Use task notifications hook
  useTaskNotifications(tasks);

  const hierarchicalTasks = buildTaskHierarchy(tasks);
  const sortedTasks = sortTasksByPriority(hierarchicalTasks);

  const handleCreateTask = (data: TaskFormData) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      dueDate: selectedDate || data.dueDate,
      weight: data.weight,
      completed: false,
      parentId: parentTaskId || data.parentId,
      subtasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      order: tasks.length
    };

    setTasks(prev => [...prev, newTask]);
    setParentTaskId(null);
    setSelectedDate(null);
    
    toast({
      title: "Task created successfully!",
      description: `"${data.title}" has been added to your task list.`,
    });
  };

  const handleUpdateTask = (data: TaskFormData) => {
    if (!editingTask) return;

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...data, updatedAt: new Date() }
        : task
    ));
    
    setEditingTask(null);
    
    toast({
      title: "Task updated successfully!",
      description: `"${data.title}" has been updated.`,
    });
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, updatedAt: new Date() }
        : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId && task.parentId !== taskId));
    
    if (taskToDelete) {
      toast({
        title: "Task deleted",
        description: `"${taskToDelete.title}" has been removed.`,
      });
    }
  };

  const handleAddSubtask = (parentId: string) => {
    setParentTaskId(parentId);
    setIsTaskModalOpen(true);
  };

  const handleReorderTasks = (oldIndex: number, newIndex: number) => {
    const reorderedTasks = [...sortedTasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);
    reorderedTasks.splice(newIndex, 0, movedTask);
    
    // Update the tasks array with new order
    const newOrder = reorderedTasks.map((task, index) => ({ ...task, order: index }));
    const taskMap = new Map(newOrder.map(task => [task.id, task.order]));
    
    setTasks(prev => prev.map(task => ({
      ...task,
      order: taskMap.get(task.id) ?? task.order
    })));
  };

  const handleAddTaskForDate = (date: Date) => {
    setSelectedDate(date);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                TaskPal
              </h1>
              <span className="text-sm text-gray-500 hidden sm:inline">Smart To-Do List</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <UrgentTasksPanel tasks={tasks} onTaskClick={handleTaskClick} />
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>List View</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Tasks</h2>
                <div className="text-sm text-gray-500">
                  {tasks.filter(t => !t.completed).length} active • {tasks.filter(t => t.completed).length} completed
                </div>
              </div>
              
              {sortedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <List className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                  <p className="text-gray-500 mb-4">Create your first task to get started!</p>
                  <Button onClick={() => setIsTaskModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Task
                  </Button>
                </div>
              ) : (
                <DraggableTaskList
                  tasks={sortedTasks}
                  onReorder={handleReorderTasks}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleTaskClick}
                  onDelete={handleDeleteTask}
                  onAddSubtask={handleAddSubtask}
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <CalendarView
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTaskForDate}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setParentTaskId(null);
          setSelectedDate(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        parentId={parentTaskId}
      />
    </div>
  );
};

export default Index;
