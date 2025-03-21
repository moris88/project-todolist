export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
  updatedAt: string | null
  completedAt: string | null
  dueDate: string | null
  notify: boolean
  priority: Priority
  category: Category
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Category = 'todo' | 'inProgress' | 'done'
