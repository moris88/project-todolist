import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import {
	HiChevronDown,
	HiChevronRight,
	HiEye,
	HiMiniPencilSquare,
	HiMiniPlus,
	HiMiniTrash,
} from 'react-icons/hi2'

import { dictAtom, projectsAtom, sprintsAtom, todoListAtom } from '@/atoms'
import { ConfirmModal, TaskDetailModal } from '@/components'
import {
	Button,
	DatePicker,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
} from '@/components/UI'
import type { Sprint, SprintStatus } from '@/types'
import { generateUniqueId, isTaskOverdue, updateTodoStorage } from '@/utils'

interface SprintFormValues {
	name: string
	description: string
	startDate: string | null
	dueDate: string | null
	status: SprintStatus
	projectId: string | null
}

const defaultForm: SprintFormValues = {
	name: '',
	description: '',
	startDate: null,
	dueDate: null,
	status: 'planning',
	projectId: null,
}

function SprintsManager() {
	const [sprints, setSprints] = useAtom(sprintsAtom)
	const [todos, setTodos] = useAtom(todoListAtom)
	const projects = useAtomValue(projectsAtom)
	const dict = useAtomValue(dictAtom)
	const [detailTodoId, setDetailTodoId] = React.useState<string | null>(null)
	const [showForm, setShowForm] = React.useState(false)
	const [editingSprint, setEditingSprint] = React.useState<Sprint | null>(null)
	const [deleteId, setDeleteId] = React.useState<string | null>(null)
	const [form, setForm] = React.useState<SprintFormValues>(defaultForm)
	const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

	const openCreate = () => {
		setForm(defaultForm)
		setEditingSprint(null)
		setShowForm(true)
	}

	const openEdit = (sprint: Sprint) => {
		setForm({
			name: sprint.name,
			description: sprint.description,
			startDate: sprint.startDate,
			dueDate: sprint.dueDate,
			status: sprint.status,
			projectId: sprint.projectId ?? null,
		})
		setEditingSprint(sprint)
		setShowForm(true)
	}

	const handleSave = () => {
		if (!form.name.trim()) return
		if (!form.projectId) return
		if (editingSprint) {
			setSprints((prev) =>
				prev.map((s) =>
					s.id === editingSprint.id
						? {
								...s,
								...form,
								name: form.name.trim(),
								updatedAt: new Date().toISOString(),
							}
						: s,
				),
			)
		} else {
			const newSprint: Sprint = {
				id: generateUniqueId(),
				name: form.name.trim(),
				description: form.description.trim(),
				startDate: form.startDate,
				dueDate: form.dueDate,
				status: form.status,
				projectId: form.projectId,
				createdAt: new Date().toISOString(),
				updatedAt: null,
			}
			setSprints((prev) => [...prev, newSprint])
		}
		setShowForm(false)
		setEditingSprint(null)
	}

	const handleDelete = () => {
		if (!deleteId) return
		setSprints((prev) => prev.filter((s) => s.id !== deleteId))
		setDeleteId(null)
	}

	const taskCount = (sprintId: string) =>
		todos.filter((t) => t.sprintId === sprintId && !t.deletedAt).length

	const sprintTodos = (sprintId: string) =>
		todos.filter((t) => t.sprintId === sprintId && !t.deletedAt)

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

	const statusBadge: Record<SprintStatus, string> = {
		planning: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
		active:
			'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
		completed:
			'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
		cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
	}

	return (
		<div className="mt-4 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-gray-800 text-xl dark:text-gray-100">
					{dict.sprints.title}
				</h2>
				<Button size="sm" variant="primary" onPress={openCreate}>
					<HiMiniPlus className="h-4 w-4" />
					{dict.sprints.add}
				</Button>
			</div>

			{sprints.length === 0 ? (
				<p className="select-none py-8 text-center text-gray-400 italic">
					{dict.sprints.no_sprints}
				</p>
			) : (
				<div className="flex flex-col gap-3">
					{sprints.map((sprint) => {
						const isExpanded = expandedIds.has(sprint.id)
						const sTodos = sprintTodos(sprint.id)
						return (
							<div
								key={sprint.id}
								className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
							>
								<div className="flex items-start gap-3 p-4">
									<button
										className="mt-0.5 shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
										type="button"
										onClick={() => toggleExpanded(sprint.id)}
									>
										{isExpanded ? (
											<HiChevronDown className="h-4 w-4" />
										) : (
											<HiChevronRight className="h-4 w-4" />
										)}
									</button>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
											<span className="font-semibold text-gray-800 dark:text-gray-100">
												{sprint.name}
											</span>
											<span
												className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${statusBadge[sprint.status]}`}
											>
												{dict.sprints.status_items[sprint.status]}
											</span>
										</div>
										<div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
											{sprint.projectId && (
												<span className="font-medium text-blue-500 dark:text-blue-400">
													{
														projects.find((p) => p.id === sprint.projectId)
															?.name
													}
												</span>
											)}
											{sprint.dueDate && (
												<span
													className={
														isTaskOverdue(sprint.dueDate)
															? 'text-red-500'
															: 'text-gray-400'
													}
												>
													{dict.sprints.due_date}:{' '}
													{moment(sprint.dueDate).format('DD/MM/YYYY')}
												</span>
											)}
										</div>
										{sprint.description && (
											<p className="mt-0.5 line-clamp-2 text-gray-500 text-xs dark:text-gray-400">
												{sprint.description}
											</p>
										)}
										<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-gray-400 text-xs">
											<span>
												{taskCount(sprint.id)} {dict.sprints.tasks_count}
											</span>
											<span>
												{moment(sprint.createdAt).format('DD/MM/YYYY')}
											</span>
										</div>
									</div>
									<div className="flex shrink-0 gap-1">
										<button
											className="rounded p-1 text-gray-400 transition-colors hover:text-blue-500"
											title={dict.sprints.edit}
											type="button"
											onClick={() => openEdit(sprint)}
										>
											<HiMiniPencilSquare className="h-4 w-4" />
										</button>
										<button
											className="rounded p-1 text-gray-400 transition-colors hover:text-red-500"
											title={dict.sprints.delete}
											type="button"
											onClick={() => setDeleteId(sprint.id)}
										>
											<HiMiniTrash className="h-4 w-4" />
										</button>
									</div>
								</div>
								{isExpanded && (
									<div className="border-gray-200 border-t dark:border-gray-700">
										{sTodos.length === 0 ? (
											<p className="px-4 py-3 text-gray-400 text-sm italic">
												{dict.todolist.listitem.no_task}
											</p>
										) : (
											<ul className="divide-y divide-gray-100 dark:divide-gray-700">
												{sTodos.map((t) => (
													<li
														key={t.id}
														className="flex items-center gap-2 px-4 py-2"
													>
														<input
															checked={t.completed}
															className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-blue-500"
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
						{editingSprint ? dict.sprints.edit : dict.sprints.add}
					</ModalHeader>
					<ModalBody>
						<div className="flex flex-col gap-4">
							<Input
								isRequired
								label={dict.sprints.name}
								placeholder={dict.sprints.name_placeholder}
								value={form.name}
								onChange={(e) =>
									setForm((f) => ({ ...f, name: e.target.value }))
								}
							/>
							<div className="flex flex-col gap-1">
								<label
									className="font-medium text-gray-700 text-sm dark:text-gray-300"
									htmlFor="sprint-description"
								>
									{dict.sprints.description}
								</label>
								<textarea
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
									id="sprint-description"
									placeholder={dict.sprints.description_placeholder}
									rows={3}
									value={form.description}
									onChange={(e) =>
										setForm((f) => ({ ...f, description: e.target.value }))
									}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label
									className="font-medium text-gray-700 text-sm dark:text-gray-300"
									htmlFor="sprint-project"
								>
									{dict.sprints.project} <span className="text-red-500">*</span>
								</label>
								<select
									className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
										!form.projectId
											? 'border-red-400 dark:border-red-500'
											: 'border-gray-300 dark:border-gray-600'
									}`}
									id="sprint-project"
									value={form.projectId ?? ''}
									onChange={(e) =>
										setForm((f) => ({
											...f,
											projectId: e.target.value || null,
										}))
									}
								>
									<option value="">{dict.sprints.no_project_selected}</option>
									{projects.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name}
										</option>
									))}
								</select>
								{!form.projectId && (
									<p className="text-red-500 text-xs">
										{dict.sprints.project_required}
									</p>
								)}
							</div>
							<DatePicker
								showMonthAndYearPickers
								granularity="day"
								label={dict.sprints.start_date}
								value={form.startDate}
								onChange={(iso) => setForm((f) => ({ ...f, startDate: iso }))}
							/>
							<DatePicker
								showMonthAndYearPickers
								granularity="day"
								label={dict.sprints.due_date}
								value={form.dueDate}
								onChange={(iso) => setForm((f) => ({ ...f, dueDate: iso }))}
							/>
							<Select
								defaultSelectedKeys={form.status}
								label={dict.sprints.status}
								onChange={(e) =>
									setForm((f) => ({
										...f,
										status: e.target.value as SprintStatus,
									}))
								}
							>
								<SelectItem value="planning">
									{dict.sprints.status_items.planning}
								</SelectItem>
								<SelectItem value="active">
									{dict.sprints.status_items.active}
								</SelectItem>
								<SelectItem value="completed">
									{dict.sprints.status_items.completed}
								</SelectItem>
								<SelectItem value="cancelled">
									{dict.sprints.status_items.cancelled}
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
							{dict.sprints.cancel}
						</Button>
						<Button
							isDisabled={!form.projectId}
							size="sm"
							variant="primary"
							onPress={handleSave}
						>
							{editingSprint ? dict.sprints.save : dict.sprints.create}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Delete confirm */}
			<ConfirmModal
				buttonCancel={dict.sprints.cancel}
				buttonConfirm={dict.sprints.delete}
				description={dict.sprints.delete_confirm}
				isOpen={deleteId !== null}
				title={dict.sprints.delete}
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

export default SprintsManager
