export interface SubTask {
  id: string
  title: string
  completed: boolean
}

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
  subtasks: SubTask[]
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Category = 'todo' | 'inProgress' | 'done'

export interface Comment {
  id: string
  todoId: string
  text: string
  createdAt: string
}
