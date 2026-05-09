export interface SubTask {
	id: string
	title: string
	completed: boolean
	completedAt: string | null
	priority?: Priority
	status?: Status
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
	tags: string[]
	projectId?: string | null
	sprintId?: string | null
	deletedAt?: string | null
}

export interface Project {
	id: string
	name: string
	description: string
	color: string
	priority: Priority
	status: ProjectStatus
	createdAt: string
	updatedAt: string | null
}

export interface Sprint {
	id: string
	name: string
	color: string
	description: string
	startDate: string | null
	dueDate: string | null
	status: SprintStatus
	projectId: string | null
	createdAt: string
	updatedAt: string | null
}

export interface Comment {
	id: string
	todoId: string
	text: string
	createdAt: string
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status =
	| 'backlog'
	| 'todo'
	| 'progress'
	| 'review'
	| 'testing'
	| 'blocked'
	| 'paused'
	| 'done'
	| 'archived'

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'paused'
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled'

export interface DeletedProject extends Project {
	deletedAt: string
}

export interface DeletedSprint extends Sprint {
	deletedAt: string
}

export interface FilterState {
	status: Status | ''
	completion: 'all' | 'completed' | 'uncompleted'
	overdue: 'all' | 'overdue' | 'not_overdue'
	tags: string[]
	search: string
	dueDateFrom: string
	dueDateTo: string
	projectId?: string
	sprintId?: string
}

export type SortField = 'priority' | 'status' | 'dueDate' | ''
export type SortDir = 'asc' | 'desc'
export interface SortState {
	field: SortField
	dir: SortDir
}
