
import { Task } from '../types/task';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Write and review the Q4 project proposal document',
    dueDate: new Date('2025-05-27'),
    weight: 5,
    completed: false,
    parentId: null,
    subtasks: [],
    createdAt: new Date('2025-05-20'),
    updatedAt: new Date('2025-05-20'),
    userId: 'user1',
    order: 0
  },
  {
    id: '2',
    title: 'Research competitors',
    description: 'Analyze competitor features and pricing',
    dueDate: new Date('2025-05-28'),
    weight: 3,
    completed: false,
    parentId: '1',
    subtasks: [],
    createdAt: new Date('2025-05-20'),
    updatedAt: new Date('2025-05-20'),
    userId: 'user1',
    order: 0
  },
  {
    id: '3',
    title: 'Design mockups',
    description: 'Create initial design mockups for the new feature',
    dueDate: new Date('2025-05-29'),
    weight: 4,
    completed: false,
    parentId: null,
    subtasks: [],
    createdAt: new Date('2025-05-21'),
    updatedAt: new Date('2025-05-21'),
    userId: 'user1',
    order: 1
  },
  {
    id: '4',
    title: 'Review team feedback',
    description: 'Collect and analyze feedback from the development team',
    dueDate: new Date('2025-05-30'),
    weight: 2,
    completed: true,
    parentId: null,
    subtasks: [],
    createdAt: new Date('2025-05-19'),
    updatedAt: new Date('2025-05-25'),
    userId: 'user1',
    order: 2
  },
  {
    id: '5',
    title: 'Update documentation',
    description: 'Update API documentation with latest changes',
    dueDate: new Date('2025-06-01'),
    weight: 3,
    completed: false,
    parentId: null,
    subtasks: [],
    createdAt: new Date('2025-05-22'),
    updatedAt: new Date('2025-05-22'),
    userId: 'user1',
    order: 3
  },
  {
    id: '6',
    title: 'Create wireframes',
    description: 'Design detailed wireframes for user interface',
    dueDate: new Date('2025-05-28'),
    weight: 3,
    completed: false,
    parentId: '3',
    subtasks: [],
    createdAt: new Date('2025-05-21'),
    updatedAt: new Date('2025-05-21'),
    userId: 'user1',
    order: 0
  },
  {
    id: '7',
    title: 'User testing session',
    description: 'Conduct user testing with 5 participants',
    dueDate: new Date('2025-05-31'),
    weight: 4,
    completed: false,
    parentId: '3',
    subtasks: [],
    createdAt: new Date('2025-05-21'),
    updatedAt: new Date('2025-05-21'),
    userId: 'user1',
    order: 1
  }
];
