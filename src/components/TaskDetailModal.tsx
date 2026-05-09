import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { GoAlertFill } from 'react-icons/go'
import { HiFlag, HiOutlinePencilSquare, HiXMark } from 'react-icons/hi2'

import { dictAtom, todoListAtom } from '@/atoms'
import {
	Button,
	Chip,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	StatusDropdown,
} from '@/components/UI'
import type { Status, Todo } from '@/types'
import {
	DATE_FORMAT,
	isTaskOverdue,
	PRIORITY_CHIP_COLOR,
	tagColor,
	updateTodoStorage,
} from '@/utils'

import Comments from './Comments'
import ConfirmModal from './ConfirmModal'
import MarkdownContent from './MarkdownContent'
import TaskFormModal, {
	type SubtaskTransfer,
	type TaskFormValues,
} from './TaskFormModal'

interface TaskDetailModalProps {
	todoId: string | null
	isOpen: boolean
	onClose: () => void
}

function TaskDetailModal({ todoId, isOpen, onClose }: TaskDetailModalProps) {
	const dict = useAtomValue(dictAtom)
	const [todos, setTodos] = useAtom(todoListAtom)

	const [isEditing, setIsEditing] = React.useState(false)
	const [pendingEditValues, setPendingEditValues] =
		React.useState<TaskFormValues | null>(null)
	const [pendingTransfers, setPendingTransfers] = React.useState<
		SubtaskTransfer[]
	>([])
	const [showEditConfirm, setShowEditConfirm] = React.useState(false)

	const todo: Todo | null = todos.find((t) => t.id === todoId) ?? null

	if (!todo) return null

	const overdue = isTaskOverdue(todo.dueDate)
	const completedSubtasks =
		todo.subtasks?.filter((s) => s.completed).length ?? 0

	const toggleSubtask = (subtaskId: string) => {
		setTodos(
			updateTodoStorage(
				todos.map((t) => {
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
				}),
			),
		)
	}

	const updateStatusInline = (newStatus: Status) => {
		setTodos(
			updateTodoStorage(
				todos.map((t) => {
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
				}),
			),
		)
	}

	const handleEditSubmit = (
		values: TaskFormValues,
		transfers: SubtaskTransfer[],
	) => {
		setPendingEditValues(values)
		setPendingTransfers(transfers)
		setShowEditConfirm(true)
	}

	const confirmUpdate = () => {
		if (!pendingEditValues) return
		let updated = todos.map((t) => {
			if (t.id !== todo.id) return t
			return {
				...t,
				title: pendingEditValues.title,
				description: pendingEditValues.description,
				priority: pendingEditValues.priority as Todo['priority'],
				dueDate: pendingEditValues.dueDate,
				status: pendingEditValues.status,
				subtasks: pendingEditValues.subtasks,
				tags: pendingEditValues.tags,
				completed: pendingEditValues.status === 'done' ? true : t.completed,
				completedAt:
					pendingEditValues.status === 'done' && !t.completed
						? new Date().toISOString()
						: t.completedAt,
				updatedAt: new Date().toISOString(),
			}
		})
		for (const transfer of pendingTransfers) {
			updated = updated.map((t) => {
				if (t.id !== transfer.targetTaskId) return t
				return {
					...t,
					subtasks: [...t.subtasks, transfer.subtask],
					updatedAt: new Date().toISOString(),
				}
			})
		}
		setTodos(updateTodoStorage(updated))
		setPendingEditValues(null)
		setPendingTransfers([])
		setIsEditing(false)
		setShowEditConfirm(false)
	}

	return (
		<>
			<Modal isDismissable isOpen={isOpen} onClose={onClose}>
				<ModalContent>
					<ModalHeader>
						<div className="flex items-center justify-between gap-2">
							<div className="flex min-w-0 flex-1 items-center gap-2">
								{overdue && !todo.completed && (
									<GoAlertFill className="h-4 w-4 shrink-0 text-red-600" />
								)}
								{todo.priority !== 'medium' && (
									<HiFlag
										className={`h-4 w-4 shrink-0 ${todo.priority === 'urgent' ? 'text-red-600' : todo.priority === 'high' ? 'text-yellow-600' : 'text-green-600'}`}
									/>
								)}
								<span
									className={`truncate ${todo.completed ? 'text-green-600 line-through' : ''}`}
								>
									{todo.title}
								</span>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								<Button
									isDisabled={todo.completed || todo.status === 'archived'}
									size="sm"
									variant="ghost"
									onPress={() => setIsEditing(true)}
								>
									<HiOutlinePencilSquare className="h-4 w-4" />
									<span className="ml-1 hidden sm:inline">
										{dict.todolist.listitem.edit}
									</span>
								</Button>
								<button
									className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
									type="button"
									onClick={onClose}
								>
									<HiXMark className="h-5 w-5" />
								</button>
							</div>
						</div>
					</ModalHeader>

					<ModalBody>
						<div className="flex flex-col gap-5">
							{/* Status · Priority · Tags */}
							<div className="flex flex-wrap items-center gap-2">
								<StatusDropdown
									status={todo.status}
									statusLabel={dict.todolist.listitem.status.status}
									statusItems={dict.todolist.listitem.status.items}
									onChange={updateStatusInline}
								/>
								<Chip color={PRIORITY_CHIP_COLOR[todo.priority]}>
									{dict.todolist.listitem.priority.items[todo.priority]}
								</Chip>
								{(todo.tags ?? []).map((tag) => (
									<span
										key={tag}
										className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${tagColor(tag)}`}
									>
										{tag}
									</span>
								))}
							</div>

							{/* Dates */}
							<div className="flex flex-wrap gap-2">
								{todo.createdAt && (
									<Chip color="default" size="sm">
										{dict.todolist.listitem.createdAt}:{' '}
										{moment(todo.createdAt).format(DATE_FORMAT)}
									</Chip>
								)}
								{todo.updatedAt && (
									<Chip color="default" size="sm">
										{dict.todolist.listitem.updatedAt}:{' '}
										{moment(todo.updatedAt).format(DATE_FORMAT)}
									</Chip>
								)}
								{todo.completedAt && (
									<Chip color="success" size="sm">
										{dict.todolist.listitem.completedAt}:{' '}
										{moment(todo.completedAt).format(DATE_FORMAT)}
									</Chip>
								)}
								{todo.dueDate && (
									<Chip
										color={overdue && !todo.completed ? 'danger' : 'warning'}
										size="sm"
									>
										{overdue && !todo.completed
											? dict.todolist.listitem.expired
											: dict.todolist.listitem.dueDateAt}
										: {moment(todo.dueDate).format(DATE_FORMAT)}
									</Chip>
								)}
							</div>

							{/* Description */}
							{todo.description && (
								<div>
									<p className="mb-1.5 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
										{dict.todolist.listitem.description}
									</p>
									<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
										<MarkdownContent content={todo.description} />
									</div>
								</div>
							)}

							{/* Subtasks */}
							{(todo.subtasks?.length ?? 0) > 0 && (
								<div>
									<div className="mb-1.5 flex items-center justify-between">
										<p className="font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
											{dict.todolist.subtasks.title}
										</p>
										<span className="text-gray-400 text-xs">
											{completedSubtasks}/{todo.subtasks.length}{' '}
											{dict.todolist.subtasks.progress}
										</span>
									</div>
									<div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
										<div
											className="h-full bg-blue-500 transition-all duration-300"
											style={{
												width: `${(completedSubtasks / todo.subtasks.length) * 100}%`,
											}}
										/>
									</div>
									<ul className="flex flex-col gap-1">
										{todo.subtasks.map((s) => (
											<li
												key={s.id}
												className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
												onClick={() => !todo.completed && toggleSubtask(s.id)}
												onKeyDown={(e) => {
													if (e.key === 'Enter' || e.key === ' ') {
														e.preventDefault()
														!todo.completed && toggleSubtask(s.id)
													}
												}}
												onKeyUp={() => {}}
											>
												<input
													readOnly
													checked={s.completed}
													className="mt-0.5 shrink-0 cursor-pointer accent-blue-500"
													disabled={todo.completed}
													type="checkbox"
												/>
												<span className="flex-1">
													<span
														className={
															s.completed ? 'text-gray-400 line-through' : ''
														}
													>
														{s.title}
													</span>
													{s.completed && s.completedAt && (
														<span className="ml-1 text-gray-400 text-xs">
															— {moment(s.completedAt).format(DATE_FORMAT)}
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
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Comments */}
							<div>
								<Comments todoId={todo.id} />
							</div>
						</div>
					</ModalBody>

					<ModalFooter>
						<Button variant="ghost" onPress={onClose}>
							{dict.todolist.editTask.cancel}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

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
				}}
				isDismissable={false}
				isOpen={isEditing}
				submitLabel={dict.todolist.editTask.submit}
				onClose={() => setIsEditing(false)}
				onSubmit={handleEditSubmit}
			/>

			<ConfirmModal
				buttonCancel={dict.todolist.editTask.cancel}
				buttonConfirm={dict.todolist.editTask.submit}
				description={dict.todolist.editTask.description}
				isOpen={showEditConfirm}
				title={dict.todolist.editTask.title}
				onCancel={() => setShowEditConfirm(false)}
				onConfirm={confirmUpdate}
			/>
		</>
	)
}

export default TaskDetailModal
