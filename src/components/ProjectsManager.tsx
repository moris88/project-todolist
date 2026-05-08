import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import {
	HiChevronDown,
	HiChevronRight,
	HiEye,
	HiFlag,
	HiMiniPencilSquare,
	HiMiniPlus,
	HiMiniTrash,
} from 'react-icons/hi2'

import { dictAtom, projectsAtom, todoListAtom } from '@/atoms'
import { ConfirmModal, TaskDetailModal } from '@/components'
import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
} from '@/components/UI'
import type { Priority, Project, ProjectStatus } from '@/types'
import {
	generateUniqueId,
	isTaskOverdue,
	priorityItems,
	updateTodoStorage,
} from '@/utils'

const PROJECT_COLORS = [
	{ value: '#3b82f6', label: 'Blu' },
	{ value: '#10b981', label: 'Verde' },
	{ value: '#f59e0b', label: 'Giallo' },
	{ value: '#ef4444', label: 'Rosso' },
	{ value: '#8b5cf6', label: 'Viola' },
	{ value: '#ec4899', label: 'Rosa' },
	{ value: '#06b6d4', label: 'Ciano' },
	{ value: '#f97316', label: 'Arancio' },
]

interface ProjectFormValues {
	name: string
	description: string
	color: string
	priority: Priority
	status: ProjectStatus
}

const defaultForm: ProjectFormValues = {
	name: '',
	description: '',
	color: '#3b82f6',
	priority: 'medium',
	status: 'active',
}

function ProjectsManager() {
	const [projects, setProjects] = useAtom(projectsAtom)
	const [todos, setTodos] = useAtom(todoListAtom)
	const dict = useAtomValue(dictAtom)
	const [detailTodoId, setDetailTodoId] = React.useState<string | null>(null)
	const [showForm, setShowForm] = React.useState(false)
	const [editingProject, setEditingProject] = React.useState<Project | null>(
		null,
	)
	const [deleteId, setDeleteId] = React.useState<string | null>(null)
	const [form, setForm] = React.useState<ProjectFormValues>(defaultForm)
	const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

	const openCreate = () => {
		setForm(defaultForm)
		setEditingProject(null)
		setShowForm(true)
	}

	const openEdit = (project: Project) => {
		setForm({
			name: project.name,
			description: project.description,
			color: project.color,
			priority: project.priority,
			status: project.status,
		})
		setEditingProject(project)
		setShowForm(true)
	}

	const handleSave = () => {
		if (!form.name.trim()) return
		if (editingProject) {
			setProjects((prev) =>
				prev.map((p) =>
					p.id === editingProject.id
						? {
								...p,
								...form,
								name: form.name.trim(),
								updatedAt: new Date().toISOString(),
							}
						: p,
				),
			)
		} else {
			const newProject: Project = {
				id: generateUniqueId(),
				name: form.name.trim(),
				description: form.description.trim(),
				color: form.color,
				priority: form.priority,
				status: form.status,
				createdAt: new Date().toISOString(),
				updatedAt: null,
			}
			setProjects((prev) => [...prev, newProject])
		}
		setShowForm(false)
		setEditingProject(null)
	}

	const handleDelete = () => {
		if (!deleteId) return
		setProjects((prev) => prev.filter((p) => p.id !== deleteId))
		setDeleteId(null)
	}

	const taskCount = (projectId: string) =>
		todos.filter((t) => t.projectId === projectId && !t.deletedAt).length

	const projectTodos = (projectId: string) =>
		todos.filter((t) => t.projectId === projectId && !t.deletedAt)

	const toggleExpanded = (id: string) => {
		setExpandedIds((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const toggleComplete = (todoId: string) => {
		const updated = todos.map((t) =>
			t.id === todoId
				? {
						...t,
						completed: !t.completed,
						completedAt: !t.completed ? new Date().toISOString() : null,
					}
				: t,
		)
		setTodos(updateTodoStorage(updated))
	}

	const priorityColor: Record<Priority, string> = {
		urgent: 'text-red-600',
		high: 'text-yellow-500',
		medium: 'text-gray-400',
		low: 'text-green-600',
	}

	const statusBadge: Record<ProjectStatus, string> = {
		active:
			'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
		completed:
			'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
		archived: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
		paused:
			'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
	}

	return (
		<div className="mt-4 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-gray-800 text-xl dark:text-gray-100">
					{dict.projects.title}
				</h2>
				<Button size="sm" variant="primary" onPress={openCreate}>
					<HiMiniPlus className="h-4 w-4" />
					{dict.projects.add}
				</Button>
			</div>

			{projects.length === 0 ? (
				<p className="select-none py-8 text-center text-gray-400 italic">
					{dict.projects.no_projects}
				</p>
			) : (
				<div className="flex flex-col gap-3">
					{projects.map((project) => {
						const isExpanded = expandedIds.has(project.id)
						const pTodos = projectTodos(project.id)
						return (
							<div
								key={project.id}
								className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
							>
								<div className="flex items-start gap-3 p-4">
									<button
										className="mt-0.5 shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
										type="button"
										onClick={() => toggleExpanded(project.id)}
									>
										{isExpanded ? (
											<HiChevronDown className="h-4 w-4" />
										) : (
											<HiChevronRight className="h-4 w-4" />
										)}
									</button>
									<span
										className="mt-1 h-3 w-3 shrink-0 rounded-full"
										style={{ backgroundColor: project.color }}
									/>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
											<span className="font-semibold text-gray-800 dark:text-gray-100">
												{project.name}
											</span>
											<span
												className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${statusBadge[project.status]}`}
											>
												{dict.projects.status_items[project.status]}
											</span>
											<HiFlag
												className={`h-3.5 w-3.5 ${priorityColor[project.priority]}`}
											/>
										</div>
										{project.description && (
											<p className="mt-0.5 line-clamp-2 text-gray-500 text-xs dark:text-gray-400">
												{project.description}
											</p>
										)}
										<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-gray-400 text-xs">
											<span>
												{taskCount(project.id)} {dict.projects.tasks_count}
											</span>
											<span>
												{moment(project.createdAt).format('DD/MM/YYYY')}
											</span>
										</div>
									</div>
									<div className="flex shrink-0 gap-1">
										<button
											className="rounded p-1 text-gray-400 transition-colors hover:text-blue-500"
											title={dict.projects.edit}
											type="button"
											onClick={() => openEdit(project)}
										>
											<HiMiniPencilSquare className="h-4 w-4" />
										</button>
										<button
											className="rounded p-1 text-gray-400 transition-colors hover:text-red-500"
											title={dict.projects.delete}
											type="button"
											onClick={() => setDeleteId(project.id)}
										>
											<HiMiniTrash className="h-4 w-4" />
										</button>
									</div>
								</div>
								{isExpanded && (
									<div className="border-gray-200 border-t dark:border-gray-700">
										{pTodos.length === 0 ? (
											<p className="px-4 py-3 text-gray-400 text-sm italic">
												{dict.todolist.listitem.no_task}
											</p>
										) : (
											<ul className="divide-y divide-gray-100 dark:divide-gray-700">
												{pTodos.map((t) => (
													<li
														key={t.id}
														className="flex items-center gap-2 px-4 py-2"
													>
														<input
															checked={t.completed}
															className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-blue-500"
															title={
																t.completed
																	? dict.todolist.listitem.edit
																	: dict.todolist.listitem.edit
															}
															type="checkbox"
															onChange={() => toggleComplete(t.id)}
														/>
														<span
															className={`min-w-0 flex-1 truncate text-sm ${
																t.completed
																	? 'text-gray-400 line-through'
																	: isTaskOverdue(t.dueDate)
																		? 'text-red-600 dark:text-red-400'
																		: 'text-gray-700 dark:text-gray-200'
															}`}
														>
															{t.title}
														</span>
														{t.dueDate && (
															<span
																className={`shrink-0 text-xs ${isTaskOverdue(t.dueDate) ? 'text-red-500' : 'text-gray-400'}`}
															>
																{moment(t.dueDate).format('DD/MM')}
															</span>
														)}
														<button
															className="shrink-0 rounded p-0.5 text-gray-300 transition-colors hover:text-blue-500 dark:text-gray-600 dark:hover:text-blue-400"
															title={dict.todolist.listitem.detail}
															type="button"
															onClick={() => setDetailTodoId(t.id)}
														>
															<HiEye className="h-3.5 w-3.5" />
														</button>
													</li>
												))}
											</ul>
										)}
									</div>
								)}
							</div>
						)
					})}
				</div>
			)}

			{/* Create/Edit modal */}
			<Modal isDismissable isOpen={showForm} onClose={() => setShowForm(false)}>
				<ModalContent>
					<ModalHeader>
						{editingProject ? dict.projects.edit : dict.projects.add}
					</ModalHeader>
					<ModalBody>
						<div className="flex flex-col gap-4">
							<Input
								isRequired
								label={dict.projects.name}
								placeholder={dict.projects.name_placeholder}
								value={form.name}
								onChange={(e) =>
									setForm((f) => ({ ...f, name: e.target.value }))
								}
							/>
							<div className="flex flex-col gap-1">
								<label
									className="font-medium text-gray-700 text-sm dark:text-gray-300"
									htmlFor="project-description"
								>
									{dict.projects.description}
								</label>
								<textarea
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
									id="project-description"
									placeholder={dict.projects.description_placeholder}
									rows={3}
									value={form.description}
									onChange={(e) =>
										setForm((f) => ({ ...f, description: e.target.value }))
									}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<p className="font-medium text-gray-700 text-sm dark:text-gray-300">
									{dict.projects.color}
								</p>
								<div className="flex flex-wrap gap-2">
									{PROJECT_COLORS.map((c) => (
										<button
											key={c.value}
											className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${form.color === c.value ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}`}
											style={{ backgroundColor: c.value }}
											title={c.label}
											type="button"
											onClick={() => setForm((f) => ({ ...f, color: c.value }))}
										/>
									))}
								</div>
							</div>
							<Select
								defaultSelectedKeys={priorityItems
									.indexOf(form.priority)
									.toString()}
								label={dict.projects.priority}
								onChange={(e) => {
									const map: Record<string, Priority> = {
										'0': 'urgent',
										'1': 'high',
										'2': 'medium',
										'3': 'low',
									}
									setForm((f) => ({ ...f, priority: map[e.target.value] }))
								}}
							>
								{priorityItems.map((item, index) => (
									<SelectItem
										key={index}
										startContent={
											<HiFlag
												className={`h-3.5 w-3.5 ${priorityColor[item as Priority]}`}
											/>
										}
										value={String(index)}
									>
										{dict.todolist.listitem.priority.items[item as Priority]}
									</SelectItem>
								))}
							</Select>
							<Select
								defaultSelectedKeys={form.status}
								label={dict.projects.status}
								onChange={(e) =>
									setForm((f) => ({
										...f,
										status: e.target.value as ProjectStatus,
									}))
								}
							>
								<SelectItem value="active">
									{dict.projects.status_items.active}
								</SelectItem>
								<SelectItem value="paused">
									{dict.projects.status_items.paused}
								</SelectItem>
								<SelectItem value="completed">
									{dict.projects.status_items.completed}
								</SelectItem>
								<SelectItem value="archived">
									{dict.projects.status_items.archived}
								</SelectItem>
							</Select>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							size="sm"
							variant="ghost"
							onPress={() => setShowForm(false)}
						>
							{dict.projects.cancel}
						</Button>
						<Button size="sm" variant="primary" onPress={handleSave}>
							{editingProject ? dict.projects.save : dict.projects.create}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Delete confirm */}
			<ConfirmModal
				buttonCancel={dict.projects.cancel}
				buttonConfirm={dict.projects.delete}
				description={dict.projects.delete_confirm}
				isOpen={deleteId !== null}
				title={dict.projects.delete}
				onCancel={() => setDeleteId(null)}
				onConfirm={handleDelete}
			/>

			{/* Task detail */}
			<TaskDetailModal
				isOpen={detailTodoId !== null}
				todoId={detailTodoId}
				onClose={() => setDetailTodoId(null)}
			/>
		</div>
	)
}

export default ProjectsManager
