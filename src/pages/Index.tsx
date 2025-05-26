
import React, { useState } from 'react';
import { Plus, List, Calendar as CalendarIcon, Settings, LogOut, CheckCircle } from 'lucide-react';
import { ViewMode, Task, TaskFormData } from '../types/task';
import { buildTaskHierarchy, sortTasksByPriority } from '../utils/taskUtils';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import TaskFormModal from '../components/TaskFormModal';
import UrgentTasksPanel from '../components/UrgentTasksPanel';
import CalendarView from '../components/CalendarView';
import DraggableTaskList from '../components/DraggableTaskList';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useTaskNotifications } from '../hooks/useToasts';

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, toggleTaskComplete, deleteTask, reorderTasks } = useTasks();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Use task notifications hook
  useTaskNotifications(tasks);

  // Separate active and completed tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  const sortedActiveTasks = sortTasksByPriority(activeTasks);

  const handleCreateTask = async (data: TaskFormData) => {
    await createTask({
      ...data,
      dueDate: selectedDate || data.dueDate,
    }, parentTaskId);
    setParentTaskId(null);
    setSelectedDate(null);
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, data);
    setEditingTask(null);
  };

  const handleAddSubtask = (parentId: string) => {
    setParentTaskId(parentId);
    setIsTaskModalOpen(true);
  };

  const handleReorderTasks = async (oldIndex: number, newIndex: number) => {
    const reorderedTasks = [...sortedActiveTasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);
    reorderedTasks.splice(newIndex, 0, movedTask);
    
    const taskIds = reorderedTasks.map(task => task.id);
    await reorderTasks(taskIds);
  };

  const handleAddTaskForDate = (date: Date) => {
    setSelectedDate(date);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
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
              
              <Button onClick={() => setIsAuthModalOpen(true)}>
                Sign In
              </Button>
            </div>
          </div>
        </header>

        {/* Welcome Content */}
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to TaskPal
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Your intelligent task management companion with smart priority scoring and nested subtasks
          </p>
          <Button 
            size="lg" 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            Get Started
          </Button>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

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
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {tasksLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your tasks...</p>
          </div>
        ) : (
          <>
            <UrgentTasksPanel tasks={[...activeTasks, ...completedTasks]} onTaskClick={handleTaskClick} />
            
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
                      {activeTasks.length} active • {completedTasks.length} completed
                    </div>
                  </div>
                  
                  {sortedActiveTasks.length === 0 && completedTasks.length === 0 ? (
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
                    <div className="space-y-6">
                      {/* Active Tasks */}
                      {sortedActiveTasks.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-4">Active Tasks</h3>
                          <DraggableTaskList
                            tasks={sortedActiveTasks}
                            onReorder={handleReorderTasks}
                            onToggleComplete={toggleTaskComplete}
                            onEdit={handleTaskClick}
                            onDelete={deleteTask}
                            onAddSubtask={handleAddSubtask}
                          />
                        </div>
                      )}
                      
                      {/* Completed Tasks */}
                      {completedTasks.length > 0 && (
                        <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-lg font-medium">Completed Tasks ({completedTasks.length})</span>
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-4">
                            <div className="space-y-3">
                              {completedTasks.map((task) => (
                                <div key={task.id} className="opacity-75">
                                  {/* Render completed tasks without drag functionality */}
                                  <div className="border-l-4 border-l-gray-300 bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start space-x-3 flex-1">
                                        <input
                                          type="checkbox"
                                          checked={true}
                                          onChange={() => toggleTaskComplete(task.id)}
                                          className="mt-1"
                                        />
                                        <div>
                                          <h4 className="font-medium text-gray-500 line-through">{task.title}</h4>
                                          {task.description && (
                                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTask(task.id)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-6">
                <CalendarView
                  tasks={[...activeTasks, ...completedTasks]}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTaskForDate}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
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
