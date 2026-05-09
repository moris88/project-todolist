import { describe, expect, it } from 'vitest'
import type { Project, Sprint, Todo } from '../src/types'
import {
	getActiveTodos,
	getOverdueTasks,
	getProjectStats,
	getProjectsByStatus,
	getSprintStats,
	getSprintsByStatus,
	getTasksByPriority,
	getTasksByStatus,
	getTasksOverTime,
} from '../src/utils/stats'

function makeTodo(overrides: Partial<Todo> = {}): Todo {
	return {
		id: 'id-1',
		title: 'Test',
		description: '',
		completed: false,
		createdAt: new Date().toISOString(),
		updatedAt: null,
		completedAt: null,
		dueDate: null,
		notify: false,
		priority: 'medium',
		status: 'todo',
		subtasks: [],
		tags: [],
		projectId: null,
		sprintId: null,
		deletedAt: null,
		...overrides,
	}
}

function makeProject(overrides: Partial<Project> = {}): Project {
	return {
		id: 'proj-1',
		name: 'Project',
		description: '',
		color: '#3b82f6',
		priority: 'medium',
		status: 'active',
		createdAt: new Date().toISOString(),
		updatedAt: null,
		...overrides,
	}
}

function makeSprint(overrides: Partial<Sprint> = {}): Sprint {
	return {
		id: 'sprint-1',
		name: 'Sprint 1',
		description: '',
		color: '#3b82f6',
		startDate: null,
		dueDate: null,
		status: 'active',
		projectId: 'proj-1',
		createdAt: new Date().toISOString(),
		updatedAt: null,
		...overrides,
	}
}

describe('getActiveTodos', () => {
	it('filtra i todo con deletedAt valorizzato', () => {
		const todos = [
			makeTodo({ id: '1' }),
			makeTodo({ id: '2', deletedAt: new Date().toISOString() }),
		]
		expect(getActiveTodos(todos)).toHaveLength(1)
		expect(getActiveTodos(todos)[0].id).toBe('1')
	})

	it('restituisce tutti se nessuno è eliminato', () => {
		const todos = [makeTodo({ id: '1' }), makeTodo({ id: '2' })]
		expect(getActiveTodos(todos)).toHaveLength(2)
	})

	it('restituisce array vuoto per input vuoto', () => {
		expect(getActiveTodos([])).toHaveLength(0)
	})
})

describe('getTasksByStatus', () => {
	it('conta correttamente per status', () => {
		const todos = [
			makeTodo({ status: 'todo' }),
			makeTodo({ status: 'todo' }),
			makeTodo({ status: 'done' }),
		]
		const result = getTasksByStatus(todos)
		const todoEntry = result.find((e) => e.name === 'todo')
		const doneEntry = result.find((e) => e.name === 'done')
		expect(todoEntry?.value).toBe(2)
		expect(doneEntry?.value).toBe(1)
	})

	it('restituisce array vuoto per todo vuoti', () => {
		expect(getTasksByStatus([])).toHaveLength(0)
	})

	it('non include status con 0 occorrenze', () => {
		const todos = [makeTodo({ status: 'done' })]
		const result = getTasksByStatus(todos)
		expect(result.every((e) => e.value > 0)).toBe(true)
	})
})

describe('getTasksByPriority', () => {
	it('rispetta l\'ordine urgent → low', () => {
		const todos = [
			makeTodo({ priority: 'low' }),
			makeTodo({ priority: 'urgent' }),
			makeTodo({ priority: 'medium' }),
		]
		const result = getTasksByPriority(todos)
		const names = result.map((e) => e.name)
		expect(names.indexOf('urgent')).toBeLessThan(names.indexOf('medium'))
		expect(names.indexOf('medium')).toBeLessThan(names.indexOf('low'))
	})

	it('non include priorità con 0 occorrenze', () => {
		const todos = [makeTodo({ priority: 'high' })]
		const result = getTasksByPriority(todos)
		expect(result).toHaveLength(1)
		expect(result[0].name).toBe('high')
	})
})

describe('getOverdueTasks', () => {
	it('conta solo i non completati con dueDate nel passato', () => {
		const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
		const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
		const todos = [
			makeTodo({ dueDate: past }),
			makeTodo({ dueDate: future }),
			makeTodo({ dueDate: null }),
		]
		expect(getOverdueTasks(todos)).toBe(1)
	})

	it('ignora i todo completati anche se scaduti', () => {
		const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
		const todos = [
			makeTodo({ dueDate: past, completed: true }),
			makeTodo({ dueDate: past, completed: false }),
		]
		expect(getOverdueTasks(todos)).toBe(1)
	})

	it('restituisce 0 per array vuoto', () => {
		expect(getOverdueTasks([])).toBe(0)
	})
})

describe('getTasksOverTime', () => {
	it('restituisce sempre 12 entries', () => {
		const result = getTasksOverTime([])
		expect(result).toHaveLength(12)
	})

	it('conta correttamente un todo creato questa settimana', () => {
		const todo = makeTodo({ createdAt: new Date().toISOString() })
		const result = getTasksOverTime([todo])
		const lastEntry = result[result.length - 1]
		expect(lastEntry.created).toBe(1)
	})

	it('conta correttamente un todo completato questa settimana', () => {
		const todo = makeTodo({
			completedAt: new Date().toISOString(),
			completed: true,
		})
		const result = getTasksOverTime([todo])
		const lastEntry = result[result.length - 1]
		expect(lastEntry.completed).toBe(1)
	})

	it('ignora todo creati prima della finestra di 12 settimane', () => {
		const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
		const todo = makeTodo({ createdAt: old })
		const result = getTasksOverTime([todo])
		const totalCreated = result.reduce((sum, e) => sum + e.created, 0)
		expect(totalCreated).toBe(0)
	})
})

describe('getProjectStats', () => {
	it('calcola completionRate corretto', () => {
		const project = makeProject({ id: 'p1' })
		const todos = [
			makeTodo({ projectId: 'p1', completed: true }),
			makeTodo({ projectId: 'p1', completed: true }),
			makeTodo({ projectId: 'p1', completed: false }),
			makeTodo({ projectId: 'p1', completed: false }),
		]
		const result = getProjectStats([project], todos)
		expect(result[0].completionRate).toBe(50)
		expect(result[0].total).toBe(4)
		expect(result[0].done).toBe(2)
	})

	it('restituisce completionRate 0 per progetto senza task', () => {
		const project = makeProject({ id: 'p1' })
		const result = getProjectStats([project], [])
		expect(result[0].completionRate).toBe(0)
		expect(result[0].total).toBe(0)
	})

	it('ignora task di altri progetti', () => {
		const project = makeProject({ id: 'p1' })
		const todos = [
			makeTodo({ projectId: 'p2', completed: true }),
		]
		const result = getProjectStats([project], todos)
		expect(result[0].total).toBe(0)
	})
})

describe('getProjectsByStatus', () => {
	it('conta i progetti per status', () => {
		const projects = [
			makeProject({ id: '1', status: 'active' }),
			makeProject({ id: '2', status: 'active' }),
			makeProject({ id: '3', status: 'completed' }),
		]
		const result = getProjectsByStatus(projects)
		expect(result.find((e) => e.name === 'active')?.value).toBe(2)
		expect(result.find((e) => e.name === 'completed')?.value).toBe(1)
	})

	it('non include status con 0 occorrenze', () => {
		const projects = [makeProject({ status: 'active' })]
		const result = getProjectsByStatus(projects)
		expect(result.every((e) => e.value > 0)).toBe(true)
	})
})

describe('getSprintStats', () => {
	it('conta completed e total per sprint', () => {
		const sprint = makeSprint({ id: 's1' })
		const todos = [
			makeTodo({ sprintId: 's1', completed: true }),
			makeTodo({ sprintId: 's1', completed: false }),
		]
		const result = getSprintStats([sprint], todos)
		expect(result[0].completed).toBe(1)
		expect(result[0].total).toBe(2)
	})

	it('ignora task di altri sprint', () => {
		const sprint = makeSprint({ id: 's1' })
		const todos = [makeTodo({ sprintId: 's2', completed: true })]
		const result = getSprintStats([sprint], todos)
		expect(result[0].total).toBe(0)
	})
})

describe('getSprintsByStatus', () => {
	it('conta gli sprint per status', () => {
		const sprints = [
			makeSprint({ id: '1', status: 'active' }),
			makeSprint({ id: '2', status: 'completed' }),
			makeSprint({ id: '3', status: 'completed' }),
		]
		const result = getSprintsByStatus(sprints)
		expect(result.find((e) => e.name === 'active')?.value).toBe(1)
		expect(result.find((e) => e.name === 'completed')?.value).toBe(2)
	})
})
