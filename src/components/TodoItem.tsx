import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import moment from 'moment'
import React from 'react'
import { BiSolidDetail } from 'react-icons/bi'
import { GoAlertFill } from 'react-icons/go'
import {
	HiArrowRight,
	HiChatBubbleLeftEllipsis,
	HiEye,
	HiFlag,
	HiListBullet,
	HiMiniPlus,
	HiMiniTrash,
	HiOutlinePencilSquare,
} from 'react-icons/hi2'

import {
	commentsAtom,
	dictAtom,
	projectsAtom,
	sprintsAtom,
	todoListAtom,
	trashAtom,
} from '@/atoms/atoms'
import {
	ConfirmModal,
	MarkdownContent,
	type SubtaskTransfer,
	TaskFormModal,
	type TaskFormValues,
} from '@/components'
import {
	Button,
	ButtonGroup,
	Checkbox,
	Chip,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	Tooltip,
} from '@/components/UI'
import type { Status, Todo } from '@/types'
import {
	generateUniqueId,
	isTaskOverdue,
	removeTodoStorage,
	tagColor,
	updateTodoStorage,
} from '@/utils'

interface TodoItemProps {
	todo: Todo
	showDescriptions?: boolean
	showSubtasks?: boolean
	showOnlyTitle?: boolean
	onCommentPress?: () => void
	onDetailPress?: () => void
	isCommentOpen?: boolean
}

function TodoItem({
	todo,
	showDescriptions,
	showSubtasks,
	showOnlyTitle,
	onCommentPress,
	onDetailPress,
	isCommentOpen,
}: TodoItemProps) {
	const [todos, setTodos] = useAtom(todoListAtom)
	const comments = useAtomValue(commentsAtom)
	const setTrash = useSetAtom(trashAtom)
	const dict = useAtomValue(dictAtom)
	const projects = useAtomValue(projectsAtom)
	const sprints = useAtomValue(sprintsAtom)
	const [isEditing, setIsEditing] = React.useState(false)
	const [isExpanded, setIsExpanded] = React.useState(false)
	const [showDeleteModal, setShowDeleteModal] = React.useState(false)
	const [showEditModal, setShowEditModal] = React.useState(false)
	const [showInlineDetail, setShowInlineDetail] = React.useState(false)
	const [pendingEditValues, setPendingEditValues] =
		React.useState<TaskFormValues | null>(null)
	const [pendingTransfers, setPendingTransfers] = React.useState<
		SubtaskTransfer[]
	>([])
	const [quickAddTitle, setQuickAddTitle] = React.useState('')
	const [showSubtasksLocal, setShowSubtasksLocal] = React.useState(false)
	const [moveSubtaskId, setMoveSubtaskId] = React.useState<string | null>(null)
	const [moveTargetTodoId, setMoveTargetTodoId] = React.useState('')
	const [isEditingStatus, setIsEditingStatus] = React.useState(false)
	const statusDropdownRef = React.useRef<HTMLDivElement>(null)

	const hasComments = comments.filter((c) => c.todoId === todo.id)?.length > 0
	const hasSubtasks = todo.subtasks?.length > 0
	const countComments =
		comments.filter((c) => c.todoId === todo.id)?.length ?? 0

	const toggleTodo = (
		e?: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
	) => {
		if (e) {
			e.preventDefault()
			e.stopPropagation()
		}
		const nowCompleting = !todo.completed
		const updatedTodos = todos.map((t) => {
			if (t.id === todo.id) {
				if (t.status === 'archived') return t
				return {
					...t,
					status: nowCompleting ? 'done' : todo.status,
					completed: nowCompleting,
					completedAt: nowCompleting ? new Date().toISOString() : null,
					subtasks: nowCompleting
						? t.subtasks.map((s) => ({
								...s,
								completed: true,
								completedAt: s.completedAt ?? new Date().toISOString(),
							}))
						: t.subtasks,
					updatedAt: new Date().toISOString(),
				}
			}
			return t
		})
		setTodos(updateTodoStorage(updatedTodos))
	}

	const removeTodo = () => {
		setShowDeleteModal(true)
	}

	const confirmRemoveTodo = () => {
		const deletedTodo = { ...todo, deletedAt: new Date().toISOString() }
		setTrash((prev) => [...prev, deletedTodo])
		setTodos(removeTodoStorage(todos, todo.id))
		setShowDeleteModal(false)
	}

	const handleEditSubmit = (
		values: TaskFormValues,
		transfers: SubtaskTransfer[],
	) => {
		setPendingEditValues(values)
		setPendingTransfers(transfers)
		setShowEditModal(true)
	}

	const confirmUpdateTodo = () => {
		if (!pendingEditValues) return
		let updatedTodos = todos.map((t) => {
			if (t.id === todo.id) {
				return {
					...t,
					title: pendingEditValues.title,
					description: pendingEditValues.description,
					priority: pendingEditValues.priority as Todo['priority'],
					dueDate: pendingEditValues.dueDate,
					status: pendingEditValues.status,
					subtasks: pendingEditValues.subtasks,
					tags: pendingEditValues.tags,
					projectId: pendingEditValues.projectId,
					sprintId: pendingEditValues.sprintId,
					completed: pendingEditValues.status === 'done' ? true : t.completed,
					completedAt:
						pendingEditValues.status === 'done' && !t.completed
							? new Date().toISOString()
							: t.completedAt,
					updatedAt: new Date().toISOString(),
				}
			}
			return t
		})
		for (const transfer of pendingTransfers) {
			updatedTodos = updatedTodos.map((t) => {
				if (t.id !== transfer.targetTaskId) return t
				return {
					...t,
					subtasks: [...t.subtasks, transfer.subtask],
					updatedAt: new Date().toISOString(),
				}
			})
		}
		setTodos(updateTodoStorage(updatedTodos))
		setPendingEditValues(null)
		setPendingTransfers([])
		setIsEditing(false)
		setShowEditModal(false)
	}

	const addSubtaskInline = () => {
		if (!quickAddTitle.trim()) return
		const updatedTodos = todos.map((t) => {
			if (t.id !== todo.id) return t
			return {
				...t,
				subtasks: [
					...t.subtasks,
					{
						id: generateUniqueId(),
						title: quickAddTitle.trim(),
						completed: false,
						completedAt: null,
					},
				],
				updatedAt: new Date().toISOString(),
			}
		})
		setTodos(updateTodoStorage(updatedTodos))
		setQuickAddTitle('')
	}

	const toggleSubtaskInList = (subtaskId: string) => {
		const updatedTodos = todos.map((t) => {
			if (t.id !== todo.id) return t
			return {
				...t,
				subtasks: t.subtasks.map((s) =>
					s.id === subtaskId
						? {
								...s,
								completed: !s.completed,
								completedAt: !s.completed ? new Date().toISOString() : null,
							}
						: s,
				),
				updatedAt: new Date().toISOString(),
			}
		})
		setTodos(updateTodoStorage(updatedTodos))
	}

	const confirmMoveSubtask = () => {
		if (!moveSubtaskId || !moveTargetTodoId) return
		const subtask = todo.subtasks.find((s) => s.id === moveSubtaskId)
		if (!subtask) return
		const updated = todos.map((t) => {
			if (t.id === todo.id) {
				return {
					...t,
					subtasks: t.subtasks.filter((s) => s.id !== moveSubtaskId),
					updatedAt: new Date().toISOString(),
				}
			}
			if (t.id === moveTargetTodoId) {
				return {
					...t,
					subtasks: [...t.subtasks, subtask],
					updatedAt: new Date().toISOString(),
				}
			}
			return t
		})
		setTodos(updateTodoStorage(updated))
		setMoveSubtaskId(null)
		setMoveTargetTodoId('')
	}

	const allStatuses: Status[] = [
		'backlog',
		'todo',
		'progress',
		'review',
		'testing',
		'paused',
		'done',
		'blocked',
		'archived',
	]

	const statusColor = (s: Status) =>
		s === 'done'
			? 'bg-green-500'
			: s === 'todo' || s === 'backlog'
				? 'bg-gray-400'
				: s === 'archived' || s === 'blocked'
					? 'bg-red-500'
					: 'bg-yellow-500'

	const updateStatusInline = (newStatus: Status) => {
		const updatedTodos = todos.map((t) => {
			if (t.id !== todo.id) return t
			return {
				...t,
				status: newStatus,
				completed: newStatus === 'done',
				completedAt:
					newStatus === 'done' && !t.completed
						? new Date().toISOString()
						: t.completedAt,
				updatedAt: new Date().toISOString(),
			}
		})
		setTodos(updateTodoStorage(updatedTodos))
		setIsEditingStatus(false)
	}

	React.useEffect(() => {
		if (!isEditingStatus) return
		const handler = (e: MouseEvent) => {
			if (!statusDropdownRef.current?.contains(e.target as Node)) {
				setIsEditingStatus(false)
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [isEditingStatus])


	return (
		<div className={`flex w-full flex-col items-start justify-start gap-y-2`}>
			<TaskFormModal
				allTasks={todos}
				cancelLabel={dict.todolist.editTask.cancel}
				currentTaskId={todo.id}
				headerLabel={dict.todolist.editTask.info}
				initialValues={{
					title: todo.title,
					description: todo.description,
					priority: todo.priority,
					dueDate: todo.dueDate,
					status: todo.status,
					subtasks: todo.subtasks,
					tags: todo.tags ?? [],
					projectId: todo.projectId ?? null,
					sprintId: todo.sprintId ?? null,
				}}
				isDismissable={false}
				isOpen={isEditing}
				submitLabel={dict.todolist.editTask.submit}
				onClose={() => setIsEditing(false)}
				onSubmit={handleEditSubmit}
			/>
			<div className="flex w-full flex-col gap-y-4">
				<div className="flex w-full flex-col items-start gap-y-2">
					<div className="flex w-full items-center gap-2 font-bold">
						<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
							<div className="flex shrink-0 items-center">
								<Checkbox
									isDisabled={
										todo.status === 'archived' || todo.status === 'blocked'
									}
									isSelected={todo.completed}
									onChange={() => toggleTodo()}
								/>
							</div>
							{isTaskOverdue(todo.dueDate) && <GoAlertFill className="h-4 w-4 text-red-600" />}{' '}
							{todo.priority !== 'medium' && (
								<HiFlag className={`h-3 w-3 ${todo.priority === 'urgent' ? 'text-red-600' : todo.priority === 'high' ? 'text-yellow-600' : 'text-green-600'}`} />
							)}{' '}
							<span
								className={`line-clamp-1 overflow-hidden text-ellipsis ${
									todo.completed
										? 'text-green-600 line-through'
										: todo.dueDate && new Date(todo.dueDate) < new Date()
											? 'text-red-600'
											: todo.priority === 'urgent'
												? 'text-black dark:text-white'
												: ''
								}`}
							>
								{todo.title}
							</span>
							{(todo.tags ?? []).length > 0 && (
								<div className="flex flex-wrap gap-1">
									{(todo.tags ?? []).map((tag) => (
										<span
											key={tag}
											className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${tagColor(tag)}`}
										>
											{tag}
										</span>
									))}
								</div>
							)}
							{todo.projectId &&
								(() => {
									const project = projects.find((p) => p.id === todo.projectId)
									return project ? (
										<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 text-xs dark:bg-gray-700 dark:text-gray-300">
											<span
												className="h-2 w-2 shrink-0 rounded-full"
												style={{ backgroundColor: project.color }}
											/>
											{project.name}
										</span>
									) : null
								})()}
							{todo.sprintId &&
								(() => {
									const sprint = sprints.find((s) => s.id === todo.sprintId)
									return sprint ? (
										<span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600 text-xs dark:bg-blue-900/30 dark:text-blue-400">
											{sprint.name}
										</span>
									) : null
								})()}
						</div>
						{onDetailPress && (
							<Tooltip content={dict.todolist.listitem.detail} placement="left">
								<button
									className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-blue-500 dark:hover:text-blue-400"
									type="button"
									onClick={(e) => {
										e.stopPropagation()
										onDetailPress()
									}}
									onPointerDown={(e) => e.stopPropagation()}
								>
									<HiEye className="h-4 w-4" />
								</button>
							</Tooltip>
						)}
					</div>
					{!showOnlyTitle && (showSubtasks || showSubtasksLocal) && (
						<div className="w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40">
							{todo.subtasks?.length > 0 && (
								<>
									<div className="flex items-center justify-between px-3 pt-2 pb-1">
										<span className="font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
											{dict.todolist.subtasks.title}
										</span>
										<span className="text-gray-400 text-xs">
											{todo.subtasks.filter((s) => s.completed).length}/
											{todo.subtasks.length} {dict.todolist.subtasks.progress}
										</span>
									</div>
									<div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
										<div
											className="h-full bg-blue-500 transition-all duration-300"
											style={{
												width: `${(todo.subtasks.filter((s) => s.completed).length / todo.subtasks.length) * 100}%`,
											}}
										/>
									</div>
									<ul className="flex flex-col gap-0.5 px-2 py-1">
										{todo.subtasks.map((s) => (
											<li
												key={s.id}
												className="group flex cursor-pointer items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
												onClick={() => toggleSubtaskInList(s.id)}
												onKeyDown={(e) => {
													if (e.key === 'Enter' || e.key === ' ') {
														e.preventDefault()
														toggleSubtaskInList(s.id)
													}
												}}
												onKeyUp={() => {}}
											>
												<input
													checked={s.completed}
													className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-blue-500"
													type="checkbox"
													onChange={() => toggleSubtaskInList(s.id)}
													onClick={(e) => e.stopPropagation()}
												/>
												<span className="flex-1">
													<span
														className={`block text-sm leading-snug ${s.completed ? 'text-gray-400 line-through' : ''}`}
													>
														{s.title}
													</span>
													{s.completed && s.completedAt && (
														<span className="block text-gray-400 text-xs dark:text-gray-500">
															{dict.todolist.listitem.completedAt}:{' '}
															{moment(s.completedAt).format('DD/MM/YYYY HH:mm')}
														</span>
													)}
													{!s.completed && (s.priority || s.status) && (
														<span className="mt-0.5 flex flex-wrap gap-1">
															{s.priority && s.priority !== 'medium' && (
																<span
																	className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium text-xs ${
																		s.priority === 'urgent'
																			? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
																			: s.priority === 'high'
																				? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
																				: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
																	}`}
																>
																	{
																		dict.todolist.listitem.priority.items[
																			s.priority
																		]
																	}
																</span>
															)}
															{s.status && s.status !== 'backlog' && (
																<span
																	className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium text-xs ${
																		s.status === 'done'
																			? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
																			: s.status === 'blocked' ||
																					s.status === 'archived'
																				? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
																				: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
																	}`}
																>
																	{
																		dict.todolist.listitem.status.items[
																			s.status
																		]
																	}
																</span>
															)}
														</span>
													)}
												</span>
												{todos.filter((t) => t.id !== todo.id).length > 0 && (
													<Tooltip
														content={dict.todolist.subtasks.move}
														placement="top"
													>
														<button
															className="shrink-0 cursor-pointer rounded p-0.5 text-gray-300 opacity-0 transition-all hover:text-blue-500 group-hover:opacity-100 dark:text-white"
															title={dict.todolist.subtasks.move}
															type="button"
															onClick={(e) => {
																e.stopPropagation()
																setMoveSubtaskId(s.id)
																setMoveTargetTodoId(
																	todos.filter((t) => t.id !== todo.id)[0]
																		?.id ?? '',
																)
															}}
														>
															<HiArrowRight className="h-3.5 w-3.5" />
														</button>
													</Tooltip>
												)}
											</li>
										))}
									</ul>
								</>
							)}
							{(showSubtasks || showSubtasksLocal) &&
								!todo.completed &&
								todo.status !== 'archived' && (
									<div className="flex items-center gap-2 border-gray-200 border-t px-2 py-2 dark:border-gray-700">
										<input
											className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
											placeholder={dict.todolist.subtasks.placeholder}
											type="text"
											value={quickAddTitle}
											onChange={(e) => setQuickAddTitle(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault()
													addSubtaskInline()
												}
											}}
										/>
										<button
											className="shrink-0 rounded bg-blue-500 p-1 text-white transition-colors hover:bg-blue-600"
											type="button"
											onClick={addSubtaskInline}
										>
											<HiMiniPlus className="h-4 w-4" />
										</button>
									</div>
								)}
						</div>
					)}
					{!showOnlyTitle &&
						(showDescriptions || showInlineDetail) &&
						todo.description && (
							<div className="w-full px-1">
								<div className={isExpanded ? '' : 'line-clamp-3'}>
									<MarkdownContent content={todo.description} />
								</div>
								<Button
									size="sm"
									variant="ghost"
									onPress={() => setIsExpanded((prev) => !prev)}
								>
									{isExpanded
										? dict.todolist.listitem.show_less
										: dict.todolist.listitem.show_more}
								</Button>
							</div>
						)}
				</div>

				<div
					className={
						showOnlyTitle
							? 'flex justify-start'
							: 'flex flex-col gap-y-4 md:flex-row md:justify-between'
					}
				>
					{!showOnlyTitle && (
						<small className="flex flex-wrap items-center gap-1">
							{todo.createdAt && (
								<Chip color="default" size="sm">
									{dict.todolist.listitem.createdAt}:{' '}
									{moment(todo.createdAt).format('DD/MM/YYYY HH:mm')}
								</Chip>
							)}

							{todo.updatedAt && (
								<Chip color="default" size="sm">
									{dict.todolist.listitem.updatedAt}:{' '}
									{moment(todo.updatedAt).format('DD/MM/YYYY HH:mm')}
								</Chip>
							)}

							{todo.completed ? (
								<Chip color="success" size="sm">
									{dict.todolist.listitem.completedAt}:{' '}
									{moment(todo.completedAt).format('DD/MM/YYYY HH:mm')}
								</Chip>
							) : (
								todo.dueDate && (
									<Chip
										color={isTaskOverdue(todo.dueDate) ? 'danger' : 'warning'}
										size="sm"
									>
										{isTaskOverdue(todo.dueDate)
											? dict.todolist.listitem.expired
											: dict.todolist.listitem.dueDateAt}
										: {moment(todo.dueDate).format('DD/MM/YYYY HH:mm')}
									</Chip>
								)
							)}
						</small>
					)}
					{!showOnlyTitle && (
						<ButtonGroup>
							<Tooltip
								content={dict.todolist.listitem.description}
								placement="top"
							>
								<Button
									className="md:px-4 md:py-2 md:text-base"
									isDisabled={
										todo.description === '' ||
										todo.description === null ||
										!!showDescriptions
									}
									size="sm"
									variant={showInlineDetail ? 'secondary' : 'primary'}
									onPress={() => setShowInlineDetail((prev) => !prev)}
								>
									<BiSolidDetail className="h-3 w-3 md:h-5 md:w-5" />
								</Button>
							</Tooltip>
							<Tooltip content={dict.todolist.subtasks.title} placement="top">
								<Button
									className="md:px-4 md:py-2 md:text-base"
									isDisabled={!!showSubtasks || todo.completed}
									size="sm"
									variant={showSubtasksLocal ? 'secondary' : 'primary'}
									onPress={() => setShowSubtasksLocal((prev) => !prev)}
								>
									<HiListBullet className="h-3 w-3 md:h-5 md:w-5" />
								</Button>
							</Tooltip>
							{onCommentPress && (
								<Tooltip content={dict.todolist.comments.title} placement="top">
									<Button
										className="md:px-4 md:py-2 md:text-base"
										size="sm"
										variant={isCommentOpen ? 'secondary' : 'primary'}
										onPress={onCommentPress}
									>
										<HiChatBubbleLeftEllipsis className="h-3 w-3 md:h-5 md:w-5" />
									</Button>
								</Tooltip>
							)}
							<Tooltip content={dict.todolist.listitem.edit} placement="top">
								<Button
									className="md:px-4 md:py-2 md:text-base"
									isDisabled={todo.completed || todo.status === 'archived'}
									size="sm"
									variant="primary"
									onPress={() => setIsEditing(true)}
								>
									<HiOutlinePencilSquare className="h-3 w-3 md:h-5 md:w-5" />
								</Button>
							</Tooltip>
							<Tooltip content={dict.todolist.listitem.delete} placement="top">
								<Button
									className="md:px-4 md:py-2 md:text-base"
									size="sm"
									variant="primary"
									onPress={removeTodo}
								>
									<HiMiniTrash className="h-3 w-3 md:h-5 md:w-5" />
								</Button>
							</Tooltip>
						</ButtonGroup>
					)}
				</div>
				{!showOnlyTitle && (
					<div className="flex w-full items-center justify-between gap-2">
						<div ref={statusDropdownRef} className="relative">
							<div className="flex items-center gap-1">
								<Chip
									color={
										todo.status === 'done'
											? 'success'
											: todo.status === 'todo' || todo.status === 'backlog'
												? 'default'
												: todo.status === 'archived' ||
														todo.status === 'blocked'
													? 'danger'
													: 'warning'
									}
								>
									{dict.todolist.listitem.status.status}:{' '}
									{dict.todolist.listitem.status.items[todo.status]}
								</Chip>
								<button
									className="rounded p-0.5 text-gray-400 transition-colors hover:text-blue-500"
									title="Modifica stato"
									type="button"
									onClick={(e) => {
										e.stopPropagation()
										setIsEditingStatus((v) => !v)
									}}
								>
									<HiOutlinePencilSquare className="h-3.5 w-3.5" />
								</button>
							</div>
							{isEditingStatus && (
								<div className="absolute top-full left-0 z-50 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
									{allStatuses.map((s) => (
										<button
											key={s}
											className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
												todo.status === s
													? 'font-semibold text-blue-600 dark:text-blue-400'
													: 'text-gray-700 dark:text-gray-300'
											}`}
											type="button"
											onClick={(e) => {
												e.stopPropagation()
												updateStatusInline(s)
											}}
										>
											<span
												className={`h-2 w-2 shrink-0 rounded-full ${statusColor(s)}`}
											/>
											{dict.todolist.listitem.status.items[s]}
										</button>
									))}
								</div>
							)}
						</div>
						<div className="flex items-center gap-2">
							{hasSubtasks && (
								<Chip color="default">
									<HiListBullet className="h-3 w-3 md:h-5 md:w-5" />
									&nbsp;
									{todo.subtasks?.length ?? 0}
								</Chip>
							)}
							{hasComments && (
								<Chip color="default">
									<HiChatBubbleLeftEllipsis className="h-3 w-3 md:h-5 md:w-5" />
									&nbsp;
									{countComments}
								</Chip>
							)}
						</div>
					</div>
				)}
			</div>

			<ConfirmModal
				buttonCancel={dict.todolist.deleteTask.cancel}
				buttonConfirm={dict.todolist.deleteTask.delete}
				description={dict.todolist.deleteTask.description}
				isOpen={showDeleteModal}
				title={dict.todolist.deleteTask.title}
				onCancel={() => setShowDeleteModal(false)}
				onConfirm={confirmRemoveTodo}
			/>

			<ConfirmModal
				buttonCancel={dict.todolist.editTask.cancel}
				buttonConfirm={dict.todolist.editTask.submit}
				description={dict.todolist.editTask.description}
				isOpen={showEditModal}
				title={dict.todolist.editTask.title}
				onCancel={() => setShowEditModal(false)}
				onConfirm={confirmUpdateTodo}
			/>

			{moveSubtaskId && (
				<Modal
					isDismissable
					isOpen={!!moveSubtaskId}
					onClose={() => setMoveSubtaskId(null)}
				>
					<ModalContent>
						<ModalHeader>{dict.todolist.subtasks.move_title}</ModalHeader>
						<ModalBody>
							<div className="flex flex-col gap-4">
								<Select
									defaultSelectedKeys={moveTargetTodoId}
									label={dict.todolist.subtasks.move_to}
									onChange={(e) => setMoveTargetTodoId(e.target.value)}
								>
									{todos.filter(
										(t) => t.id !== todo.id && t.completed === false,
									).length === 0 ? (
										<SelectItem key="no-todos" isSelected={false} value="">
											{dict.todolist.subtasks.move_no_tasks}
										</SelectItem>
									) : (
										todos
											.filter((t) => t.id !== todo.id && t.completed === false)
											.map((t) => (
												<SelectItem key={t.id} value={t.id}>
													{t.title}
												</SelectItem>
											))
									)}
								</Select>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button
								size="lg"
								variant="ghost"
								onPress={() => setMoveSubtaskId(null)}
							>
								{dict.todolist.editTask.cancel}
							</Button>
							<Button size="lg" variant="primary" onPress={confirmMoveSubtask}>
								{dict.todolist.subtasks.move_confirm}
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
		</div>
	)
}

export default TodoItem
