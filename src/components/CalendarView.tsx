import { useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

import { dictAtom, projectsAtom, sprintsAtom, todoListAtom } from '@/atoms'
import { TaskDetailModal } from '@/components'
import { isTaskOverdue, tagColor } from '@/utils'

function CalendarView() {
	const todos = useAtomValue(todoListAtom)
	const projects = useAtomValue(projectsAtom)
	const sprints = useAtomValue(sprintsAtom)
	const dict = useAtomValue(dictAtom)
	const [currentDate, setCurrentDate] = React.useState(() =>
		moment().startOf('month'),
	)
	const [selectedDay, setSelectedDay] = React.useState<string | null>(null)
	const [detailTodoId, setDetailTodoId] = React.useState<string | null>(null)

	const activeTodosWithDueDate = todos.filter((t) => !t.deletedAt && t.dueDate)

	const startOfMonth = currentDate.clone().startOf('month')
	const endOfMonth = currentDate.clone().endOf('month')
	const startDay = startOfMonth.clone().startOf('week') // monday
	const endDay = endOfMonth.clone().endOf('week')

	const days: moment.Moment[] = []
	const d = startDay.clone()
	while (d.isSameOrBefore(endDay, 'day')) {
		days.push(d.clone())
		d.add(1, 'day')
	}

	const todosForDay = (day: moment.Moment) =>
		activeTodosWithDueDate.filter((t) => moment(t.dueDate).isSame(day, 'day'))

	const selectedDayTodos = selectedDay
		? activeTodosWithDueDate.filter((t) =>
				moment(t.dueDate).isSame(selectedDay, 'day'),
			)
		: []

	const projectName = (id: string | null | undefined) =>
		projects.find((p) => p.id === id)?.name ?? null

	const sprintName = (id: string | null | undefined) =>
		sprints.find((s) => s.id === id)?.name ?? null

	const weekDays = moment
		.weekdaysShort(true)
		.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))

	return (
		<div className="mt-4 space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-gray-800 text-xl capitalize dark:text-gray-100">
					{currentDate.format('MMMM YYYY')}
				</h2>
				<div className="flex items-center gap-2">
					<button
						className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
						type="button"
						onClick={() =>
							setCurrentDate((d) => d.clone().subtract(1, 'month'))
						}
					>
						<HiChevronLeft className="h-4 w-4" />
					</button>
					<button
						className="rounded-lg border border-gray-200 px-3 py-1 text-gray-600 text-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
						type="button"
						onClick={() => setCurrentDate(moment().startOf('month'))}
					>
						{dict.calendar.today}
					</button>
					<button
						className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
						type="button"
						onClick={() => setCurrentDate((d) => d.clone().add(1, 'month'))}
					>
						<HiChevronRight className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Calendar grid */}
			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
				{/* Week day headers */}
				<div className="grid grid-cols-7 border-gray-200 border-b dark:border-gray-700">
					{weekDays.map((wd) => (
						<div
							key={wd}
							className="py-2 text-center font-semibold text-gray-500 text-xs dark:text-gray-400"
						>
							{wd}
						</div>
					))}
				</div>

				{/* Days */}
				<div className="grid grid-cols-7">
					{days.map((day, idx) => {
						const isCurrentMonth = day.isSame(currentDate, 'month')
						const isToday = day.isSame(moment(), 'day')
						const isSelected = selectedDay === day.format('YYYY-MM-DD')
						const dayTodos = todosForDay(day)
						const hasOverdue = dayTodos.some((t) => isTaskOverdue(t.dueDate))

						return (
							<button
								key={day.format('YYYY-MM-DD')}
								className={`relative min-h-[60px] cursor-pointer border-gray-100 p-1 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 ${
									idx % 7 !== 6 ? 'border-r' : ''
								} ${Math.floor(idx / 7) > 0 ? 'border-t' : ''} ${
									isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
								}`}
								type="button"
								onClick={() =>
									setSelectedDay(isSelected ? null : day.format('YYYY-MM-DD'))
								}
							>
								<span
									className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-medium text-xs ${
										isToday
											? 'bg-blue-500 text-white'
											: isCurrentMonth
												? 'text-gray-700 dark:text-gray-200'
												: 'text-gray-300 dark:text-gray-600'
									}`}
								>
									{day.date()}
								</span>
								{dayTodos.length > 0 && (
									<div className="mt-0.5 flex flex-wrap gap-0.5">
										{dayTodos.slice(0, 3).map((t) => (
											<span
												key={t.id}
												className={`block h-1.5 w-1.5 rounded-full ${
													isTaskOverdue(t.dueDate)
														? 'bg-red-500'
														: t.completed
															? 'bg-green-400'
															: 'bg-blue-400'
												}`}
											/>
										))}
										{dayTodos.length > 3 && (
											<span className="text-[10px] text-gray-400">
												+{dayTodos.length - 3}
											</span>
										)}
									</div>
								)}
								{hasOverdue && !isCurrentMonth && (
									<span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-red-400" />
								)}
							</button>
						)
					})}
				</div>
			</div>

			{/* Selected day tasks */}
			{selectedDay && (
				<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-200">
						{moment(selectedDay).format('dddd D MMMM YYYY')}
					</h3>
					{selectedDayTodos.length === 0 ? (
						<p className="text-gray-400 text-sm italic">
							{dict.todolist.listitem.no_task}
						</p>
					) : (
						<ul className="flex flex-col gap-2">
							{selectedDayTodos.map((t) => (
								<li key={t.id}>
									<button
										className={`flex w-full cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-opacity hover:opacity-80 ${
											isTaskOverdue(t.dueDate)
												? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'
												: t.completed
													? 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10'
													: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/30'
										}`}
										type="button"
										onClick={() => setDetailTodoId(t.id)}
									>
										<div className="flex items-center gap-2">
											<span
												className={`flex-1 font-medium text-sm ${
													t.completed
														? 'text-gray-400 line-through'
														: isTaskOverdue(t.dueDate)
															? 'text-red-700 dark:text-red-400'
															: 'text-gray-800 dark:text-gray-100'
												}`}
											>
												{t.title}
											</span>
											<span
												className={`rounded-full px-2 py-0.5 font-medium text-xs ${
													t.completed
														? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
														: isTaskOverdue(t.dueDate)
															? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
															: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
												}`}
											>
												{dict.todolist.listitem.status.items[t.status]}
											</span>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											{(t.tags ?? []).map((tag) => (
												<span
													key={tag}
													className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${tagColor(tag)}`}
												>
													{tag}
												</span>
											))}
											{projectName(t.projectId) && (
												<span className="text-gray-400 text-xs">
													{projectName(t.projectId)}
												</span>
											)}
											{sprintName(t.sprintId) && (
												<span className="text-gray-400 text-xs">
													{sprintName(t.sprintId)}
												</span>
											)}
										</div>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			)}

			{/* Legend */}
			<div className="flex flex-wrap gap-4 text-gray-400 text-xs dark:text-gray-500">
				<span className="flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-blue-400" />{' '}
					{dict.calendar.legend_active}
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-green-400" />{' '}
					{dict.calendar.legend_completed}
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-red-500" />{' '}
					{dict.calendar.legend_overdue}
				</span>
			</div>

			{/* Task detail */}
			<TaskDetailModal
				isOpen={detailTodoId !== null}
				todoId={detailTodoId}
				onClose={() => setDetailTodoId(null)}
			/>
		</div>
	)
}

export default CalendarView
