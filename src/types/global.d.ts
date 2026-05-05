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
  status: Status
  subtasks: SubTask[]
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status =
  | 'todo'
  | 'progress'
  | 'review'
  | 'testing'
  | 'blocked'
  | 'paused'
  | 'done'

export interface Comment {
  id: string
  todoId: string
  text: string
  createdAt: string
}
