import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import {
	HiArrowsUpDown,
	HiChevronDown,
	HiChevronLeft,
	HiChevronRight,
	HiChevronUp,
	HiFunnel,
	HiMagnifyingGlass,
	HiMiniPlus,
	HiXMark,
} from 'react-icons/hi2'

import {
	commentsAtom,
	defaultFilters,
	defaultSort,
	dictAtom,
	pageSizeAtom,
	projectsAtom,
	sprintsAtom,
	tagsAtom,
	todoFiltersAtom,
	todoListAtom,
	todoSortAtom,
} from '@/atoms'
import { Comments, TaskDetailModal, TodoInput } from '@/components'
import { Button, Switch, Tooltip } from '@/components/UI'
import { useNotificationRequest } from '@/hooks'
import type { SortField, Status } from '@/types'
import {
	applyFilters,
	getCommentsStorage,
	getTodosStorage,
	makeSortComparator,
	tagColor,
	updateTodoStorage,
} from '@/utils'

import TodoItem from './TodoItem'

function FilterPill({
	label,
	isActive,
	onClick,
}: {
	label: string
	isActive: boolean
	onClick: () => void
}) {
	return (
		<button
			className={`rounded-full px-3 py-1 font-medium text-xs transition-colors ${
				isActive
					? 'bg-blue-500 text-white'
					: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
			}`}
			type="button"
			onClick={onClick}
		>
			{label}
		</button>
	)
}

function SortPill({
	label,
	isActive,
	onClick,
}: {
	label: string
	isActive: boolean
	onClick: () => void
}) {
	return (
		<button
			className={`rounded-full px-3 py-1 font-medium text-xs transition-colors ${
				isActive
					? 'bg-violet-500 text-white'
					: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
			}`}
			type="button"
			onClick={onClick}
		>
			{label}
		</button>
	)
}

function TodoList() {
	const [todos, setTodos] = useAtom(todoListAtom)
	const [comments, setComments] = useAtom(commentsAtom)
	const [filters, setFilters] = useAtom(todoFiltersAtom)
	const [sort, setSort] = useAtom(todoSortAtom)
	const pageSize = useAtomValue(pageSizeAtom)
	const dict = useAtomValue(dictAtom)
	const globalTags = useAtomValue(tagsAtom)
	const projects = useAtomValue(projectsAtom)
	const sprints = useAtomValue(sprintsAtom)

	const [isFormOpen, setIsFormOpen] = React.useState(false)
	const [currentPage, setCurrentPage] = React.useState(1)
	const [showFilters, setShowFilters] = React.useState(() =>
		typeof window !== 'undefined'
			? window.matchMedia('(min-width: 768px)').matches
			: false,
	)
	const [showDescriptions, setShowDescriptions] = React.useState(false)
	const [showSubtasks, setShowSubtasks] = React.useState(false)
	const [showOnlyTitle, setShowOnlyTitle] = React.useState(false)
	const [selectedTodoId, setSelectedTodoId] = React.useState<string | null>(
		null,
	)
	const [detailTodoId, setDetailTodoId] = React.useState<string | null>(null)
	const { notifyUser } = useNotificationRequest()

	React.useEffect(() => {
		setComments(getCommentsStorage())
	}, [setComments])

	React.useEffect(() => {
		const now = new Date()
		const endOfToday = new Date()
		endOfToday.setHours(23, 59, 59, 999)
		const newTodos = todos.map((todo) => {
			if (!todo.dueDate || todo.completed || todo.notify) return todo
			const dueDate = new Date(todo.dueDate)
			if (dueDate < now) {
				notifyUser('Task Scaduto', `Il task "${todo.title}" è scaduto.`)
				return { ...todo, notify: true }
			}
			if (dueDate <= endOfToday) {
				notifyUser('Task in scadenza', `Il task "${todo.title}" scade oggi.`)
				return { ...todo, notify: true }
			}
			return todo
		})
		const isDifferent = JSON.stringify(newTodos) !== JSON.stringify(todos)
		if (isDifferent) {
			setTodos(updateTodoStorage(newTodos))
		}
	}, [notifyUser, setTodos, todos])

	React.useEffect(() => {
		setTodos(getTodosStorage())
	}, [setTodos])

	const updateFilters = React.useCallback(
		(update: Partial<typeof filters>) => {
			setFilters((prev) => ({ ...prev, ...update }))
			setCurrentPage(1)
		},
		[setFilters],
	)

	const resetFilters = () => {
		setFilters(defaultFilters)
		setCurrentPage(1)
	}

	const toggleTagFilter = (tag: string) => {
		updateFilters({
			tags: filters.tags.includes(tag)
				? filters.tags.filter((t) => t !== tag)
				: [...filters.tags, tag],
		})
	}

	const toggleSort = (field: SortField) => {
		if (sort.field === field) {
			if (sort.dir === 'asc') {
				setSort({ field, dir: 'desc' })
			} else {
				setSort(defaultSort)
			}
		} else {
			setSort({ field, dir: 'asc' })
		}
		setCurrentPage(1)
	}

	const activeFiltersCount = [
		filters.status !== '',
		filters.completion !== 'all',
		filters.overdue !== 'all',
		filters.tags.length > 0,
		filters.search !== '',
		(filters.dueDateFrom ?? '') !== '' || (filters.dueDateTo ?? '') !== '',
		(filters.projectId ?? '') !== '',
		(filters.sprintId ?? '') !== '',
	].filter(Boolean).length

	const filteredTodos = React.useMemo(
		() =>
			todos
				.filter((todo) => !todo.deletedAt)
				.filter((todo) => applyFilters(todo, filters, comments)),
		[todos, filters, comments],
	)

	const sortedTodos = React.useMemo(() => {
		const copy = [...filteredTodos]
		copy.sort(makeSortComparator(sort))
		return copy
	}, [filteredTodos, sort])

	const totalPages = Math.max(1, Math.ceil(sortedTodos.length / pageSize))
	const safePage = Math.min(currentPage, totalPages)
	const paginatedTodos = sortedTodos.slice(
		(safePage - 1) * pageSize,
		safePage * pageSize,
	)

	const allStatuses: { value: Status; label: string }[] = [
		{ value: 'backlog', label: dict.todolist.listitem.status.items.backlog },
		{ value: 'todo', label: dict.todolist.listitem.status.items.todo },
		{ value: 'progress', label: dict.todolist.listitem.status.items.progress },
		{ value: 'review', label: dict.todolist.listitem.status.items.review },
		{ value: 'testing', label: dict.todolist.listitem.status.items.testing },
		{ value: 'blocked', label: dict.todolist.listitem.status.items.blocked },
		{ value: 'paused', label: dict.todolist.listitem.status.items.paused },
		{ value: 'done', label: dict.todolist.listitem.status.items.done },
		{ value: 'archived', label: dict.todolist.listitem.status.items.archived },
	]

	const sortFields: { field: SortField; label: string }[] = [
		{
			field: 'priority',
			label: dict.todolist.listitem.filter.sort.priority,
		},
		{
			field: 'status',
			label: dict.todolist.listitem.filter.sort.status,
		},
		{
			field: 'dueDate',
			label: dict.todolist.listitem.filter.sort.dueDate,
		},
	]

	return (
		<div className="mt-4 min-h-[calc(100vh-250px)] space-y-4" id="todo-list">
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-gray-800 text-xl dark:text-gray-100">
					{dict.todolist.listitem.title} ({filteredTodos.length})
				</h2>
				<Button size="sm" variant="primary" onPress={() => setIsFormOpen(true)}>
					<HiMiniPlus className="h-4 w-4" />
					{dict.todolist.addTask.title}
				</Button>
			</div>
			{todos.length > 0 && (
				<>
					{/* Filter panel */}
					<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
						<button
							className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
							type="button"
							onClick={() => setShowFilters((v) => !v)}
						>
							<span className="flex items-center gap-2 font-semibold text-gray-700 text-sm dark:text-gray-300">
								<HiFunnel className="h-4 w-4" />
								{dict.todolist.listitem.filter.filters_title}
								{activeFiltersCount > 0 && (
									<span className="rounded-full bg-blue-500 px-2 py-0.5 font-normal text-white text-xs">
										{activeFiltersCount}{' '}
										{dict.todolist.listitem.filter.active_filters}
									</span>
								)}
							</span>
							<div className="flex items-center gap-3">
								{activeFiltersCount > 0 && (
									<button
										className="cursor-pointer rounded-lg border border-transparent px-2 py-1 font-medium text-red-500 text-xs transition-colors hover:border-red-700 hover:text-red-700 dark:text-red-400 hover:dark:border-red-300 dark:hover:text-red-300"
										type="button"
										onClick={(e) => {
											e.stopPropagation()
											resetFilters()
										}}
									>
										{dict.todolist.listitem.filter.reset}
									</button>
								)}
								{showFilters ? (
									<HiChevronUp className="h-4 w-4 text-gray-400" />
								) : (
									<HiChevronDown className="h-4 w-4 text-gray-400" />
								)}
							</div>
						</button>

						{showFilters && (
							<div className="border-gray-200 border-t px-4 pt-3 pb-4 dark:border-gray-700">
								<div className="flex flex-col gap-4">
									{/* Search */}
									<div className="relative">
										<HiMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
										<input
											className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-8 pl-9 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
											placeholder={
												dict.todolist.listitem.filter.search_placeholder
											}
											type="text"
											value={filters.search}
											onChange={(e) =>
												updateFilters({ search: e.target.value })
											}
										/>
										{filters.search && (
											<Tooltip
												content={dict.todolist.listitem.filter.reset}
												placement="top"
											>
												<button
													className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
													type="button"
													onClick={() => updateFilters({ search: '' })}
												>
													<HiXMark className="h-4 w-4" />
												</button>
											</Tooltip>
										)}
									</div>

									{/* Status */}
									<div>
										<p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
											{dict.todolist.listitem.filter.by_status}
										</p>
										<div className="flex flex-wrap gap-1.5">
											<FilterPill
												isActive={filters.status === ''}
												label={dict.todolist.listitem.filter.all}
												onClick={() => updateFilters({ status: '' })}
											/>
											{allStatuses.map((s) => (
												<FilterPill
													key={s.value}
													isActive={filters.status === s.value}
													label={s.label}
													onClick={() =>
														updateFilters({
															status: filters.status === s.value ? '' : s.value,
														})
													}
												/>
											))}
										</div>
									</div>

									{/* Completion + Overdue */}
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div>
											<p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
												{dict.todolist.listitem.filter.by_completion}
											</p>
											<div className="flex flex-wrap gap-1.5">
												{(
													[
														{
															value: 'all',
															label: dict.todolist.listitem.filter.all,
														},
														{
															value: 'completed',
															label: dict.todolist.listitem.filter.completed,
														},
														{
															value: 'uncompleted',
															label: dict.todolist.listitem.filter.uncompleted,
														},
													] as const
												).map((opt) => (
													<FilterPill
														key={opt.value}
														isActive={filters.completion === opt.value}
														label={opt.label}
														onClick={() =>
															updateFilters({ completion: opt.value })
														}
													/>
												))}
											</div>
										</div>
										<div>
											<p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
												{dict.todolist.listitem.filter.by_overdue}
											</p>
											<div className="flex flex-wrap gap-1.5">
												{(
													[
														{
															value: 'all',
															label: dict.todolist.listitem.filter.all,
														},
														{
															value: 'overdue',
															label: dict.todolist.listitem.filter.overdue,
														},
														{
															value: 'not_overdue',
															label: dict.todolist.listitem.filter.not_overdue,
														},
													] as const
												).map((opt) => (
													<FilterPill
														key={opt.value}
														isActive={filters.overdue === opt.value}
														label={opt.label}
														onClick={() =>
															updateFilters({ overdue: opt.value })
														}
													/>
												))}
											</div>
										</div>
									</div>

									{/* Tags */}
									{globalTags.length > 0 && (
										<div>
											<p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
												{dict.todolist.listitem.filter.by_tag}
											</p>
											<div className="flex flex-wrap gap-1.5">
												{globalTags.map((tag) => (
													<Tooltip
														key={tag}
														content={`${dict.todolist.listitem.filter.by_tag}: ${tag}`}
														placement="top"
													>
														<button
															className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs transition-all ${tagColor(tag)} ${
																filters.tags.includes(tag)
																	? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800'
																	: 'opacity-60 hover:opacity-100'
															}`}
															type="button"
															onClick={() => toggleTagFilter(tag)}
														>
															{tag}
														</button>
													</Tooltip>
												))}
											</div>
										</div>
									)}

									{/* Project filter */}
									{projects.length > 0 && (
										<div>
											<p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
												{dict.todolist.listitem.filter.by_project}
											</p>
											<div className="flex flex-wrap gap-1.5">
												<FilterPill
													isActive={(filters.projectId ?? '') === ''}
													label={dict.todolist.listitem.filter.all}
													onClick={() => updateFilters({ projectId: '' })}
												/>
												<FilterPill
													isActive={filters.projectId === '__none__'}
													label={dict.todolist.listitem.filter.no_project}
													onClick={() =>
														updateFilters({
															projectId:
																filters.projectId === '__none__'
																	? ''
																	: '__none__',
														})
													}
												/>
												{projects.map((p) => (
													<FilterPill
														key={p.id}
														isActive={filters.projectId === p.id}
														label={p.name}
														onClick={() =>
															updateFilters({
																projectId:
																	filters.projectId === p.id ? '' : p.id,
															})
														}
													/>
												))}
											</div>
										</div>
									)}

									{/* Sprint filter */}
									{sprints.length > 0 && (
										<div>
											<p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
												{dict.todolist.listitem.filter.by_sprint}
											</p>
											<div className="flex flex-wrap gap-1.5">
												<FilterPill
													isActive={(filters.sprintId ?? '') === ''}
													label={dict.todolist.listitem.filter.all}
													onClick={() => updateFilters({ sprintId: '' })}
												/>
												<FilterPill
													isActive={filters.sprintId === '__none__'}
													label={dict.todolist.listitem.filter.no_sprint}
													onClick={() =>
														updateFilters({
															sprintId:
																filters.sprintId === '__none__'
																	? ''
																	: '__none__',
														})
													}
												/>
												{sprints.map((s) => (
													<FilterPill
														key={s.id}
														isActive={filters.sprintId === s.id}
														label={s.name}
														onClick={() =>
															updateFilters({
																sprintId: filters.sprintId === s.id ? '' : s.id,
															})
														}
													/>
												))}
											</div>
										</div>
									)}

									{/* Due date range */}
									<div>
										<p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
											{dict.todolist.listitem.filter.by_due_date}
										</p>
										<div className="flex flex-wrap items-center gap-3">
											<div className="flex items-center gap-2">
												<span className="text-gray-500 text-xs dark:text-gray-400">
													{dict.todolist.listitem.filter.due_date_from}
												</span>
												<input
													className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
													type="date"
													value={filters.dueDateFrom}
													onChange={(e) =>
														updateFilters({ dueDateFrom: e.target.value })
													}
												/>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-gray-500 text-xs dark:text-gray-400">
													{dict.todolist.listitem.filter.due_date_to}
												</span>
												<input
													className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
													type="date"
													value={filters.dueDateTo}
													onChange={(e) =>
														updateFilters({ dueDateTo: e.target.value })
													}
												/>
											</div>
											{(filters.dueDateFrom || filters.dueDateTo) && (
												<Tooltip
													content={dict.todolist.listitem.filter.reset}
													placement="top"
												>
													<button
														className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
														type="button"
														onClick={() =>
															updateFilters({ dueDateFrom: '', dueDateTo: '' })
														}
													>
														<HiXMark className="h-4 w-4" />
													</button>
												</Tooltip>
											)}
										</div>
									</div>

									{/* Divider + View switches */}
									<div className="border-gray-200 border-t pt-3 dark:border-gray-700">
										<div className="flex flex-wrap gap-4">
											<Switch
												checked={showDescriptions}
												size="sm"
												onChange={(e) => setShowDescriptions(e.target.checked)}
											>
												{dict.todolist.listitem.show_descriptions}
											</Switch>
											<Switch
												checked={showSubtasks}
												size="sm"
												onChange={(e) => setShowSubtasks(e.target.checked)}
											>
												{dict.todolist.listitem.show_subtasks}
											</Switch>
											<Switch
												checked={showOnlyTitle}
												size="sm"
												onChange={(e) => setShowOnlyTitle(e.target.checked)}
											>
												{dict.todolist.listitem.show_only_title}
											</Switch>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Sort panel — visually separate */}
					<div className="overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm dark:border-violet-800/40 dark:bg-gray-800">
						<div className="flex flex-wrap items-center gap-3 px-4 py-3">
							<span className="flex items-center gap-1.5 font-semibold text-gray-700 text-sm dark:text-gray-300">
								<HiArrowsUpDown className="h-4 w-4 text-violet-500" />
								{dict.todolist.listitem.filter.sort.label}
							</span>
							<div className="flex flex-wrap gap-1.5">
								<SortPill
									isActive={sort.field === ''}
									label={dict.todolist.listitem.filter.sort.default}
									onClick={() => {
										setSort(defaultSort)
										setCurrentPage(1)
									}}
								/>
								{sortFields.map(({ field, label }) => (
									<SortPill
										key={field}
										isActive={sort.field === field}
										label={
											sort.field === field
												? `${label} (${sort.dir === 'asc' ? dict.todolist.listitem.filter.sort.asc : dict.todolist.listitem.filter.sort.desc})`
												: label
										}
										onClick={() => toggleSort(field)}
									/>
								))}
							</div>
						</div>
					</div>
				</>
			)}

			{filteredTodos.length === 0 ? (
				<p className="select-none text-center">
					{dict.todolist.listitem.no_task}
				</p>
			) : (
				<>
					{paginatedTodos.map((todo) => (
						<div
							key={todo.id}
							className={`rounded-lg ${
								todo.priority !== 'urgent'
									? 'bg-gray-200 dark:bg-slate-600 dark:text-white'
									: 'bg-red-100 text-black dark:bg-red-900/40 dark:text-red-100'
							} p-2 md:p-5`}
						>
							<TodoItem
								isCommentOpen={selectedTodoId === todo.id}
								showDescriptions={showDescriptions}
								showOnlyTitle={showOnlyTitle}
								showSubtasks={showSubtasks}
								todo={todo}
								onCommentPress={() =>
									setSelectedTodoId((prev) =>
										prev === todo.id ? null : todo.id,
									)
								}
								onDetailPress={() => setDetailTodoId(todo.id)}
							/>
							{selectedTodoId === todo.id && <Comments todoId={todo.id} />}
						</div>
					))}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-center gap-3 pt-2">
							<button
								className="rounded-lg border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
								disabled={safePage <= 1}
								type="button"
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							>
								<HiChevronLeft className="h-4 w-4" />
							</button>
							<span className="font-medium text-gray-700 text-sm dark:text-gray-300">
								{dict.todolist.listitem.filter.pagination.page} {safePage}{' '}
								{dict.todolist.listitem.filter.pagination.of} {totalPages}
							</span>
							<button
								className="rounded-lg border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
								disabled={safePage >= totalPages}
								type="button"
								onClick={() =>
									setCurrentPage((p) => Math.min(totalPages, p + 1))
								}
							>
								<HiChevronRight className="h-4 w-4" />
							</button>
						</div>
					)}
				</>
			)}

			<TodoInput isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />

			<TaskDetailModal
				isOpen={detailTodoId !== null}
				todoId={detailTodoId}
				onClose={() => setDetailTodoId(null)}
			/>
		</div>
	)
}

export default TodoList
