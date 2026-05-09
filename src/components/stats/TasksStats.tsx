import { useAtomValue } from 'jotai'
import React from 'react'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { darkModeAtom, dictAtom, todoListAtom } from '@/atoms'
import {
	getActiveTodos,
	getOverdueTasks,
	getTasksByPriority,
	getTasksByStatus,
	getTasksOverTime,
} from '@/utils/stats'
import StatsCard from './StatsCard'

function TasksStats() {
	const todos = useAtomValue(todoListAtom)
	const dict = useAtomValue(dictAtom)
	const darkMode = useAtomValue(darkModeAtom)

	const tickFill = darkMode ? '#9ca3af' : '#4b5563'
	const gridStroke = darkMode ? '#374151' : '#e5e7eb'

	const activeTodos = React.useMemo(() => getActiveTodos(todos), [todos])
	const completed = React.useMemo(
		() => activeTodos.filter((t) => t.completed).length,
		[activeTodos],
	)
	const overdue = React.useMemo(
		() => getOverdueTasks(activeTodos),
		[activeTodos],
	)
	const completionRate =
		activeTodos.length > 0
			? Math.round((completed / activeTodos.length) * 100)
			: 0
	const byStatus = React.useMemo(
		() => getTasksByStatus(activeTodos),
		[activeTodos],
	)
	const byPriority = React.useMemo(
		() => getTasksByPriority(activeTodos),
		[activeTodos],
	)
	const overTime = React.useMemo(
		() => getTasksOverTime(activeTodos),
		[activeTodos],
	)

	const statusLabels: Record<string, string> = {
		backlog: dict.todolist.listitem.status.items.backlog,
		todo: dict.todolist.listitem.status.items.todo,
		progress: dict.todolist.listitem.status.items.progress,
		review: dict.todolist.listitem.status.items.review,
		testing: dict.todolist.listitem.status.items.testing,
		blocked: dict.todolist.listitem.status.items.blocked,
		paused: dict.todolist.listitem.status.items.paused,
		done: dict.todolist.listitem.status.items.done,
		archived: dict.todolist.listitem.status.items.archived,
	}
	const priorityLabels: Record<string, string> = {
		urgent: dict.todolist.listitem.priority.items.urgent,
		high: dict.todolist.listitem.priority.items.high,
		medium: dict.todolist.listitem.priority.items.medium,
		low: dict.todolist.listitem.priority.items.low,
	}

	const sl = (key: string) => statusLabels[key] ?? key
	const pl = (key: string) => priorityLabels[key] ?? key

	if (activeTodos.length === 0) {
		return (
			<p className="py-12 text-center text-gray-400 dark:text-gray-500">
				{dict.stats.no_data}
			</p>
		)
	}

	return (
		<div className="space-y-6">
			{/* KPIs */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<StatsCard label={dict.stats.total} value={activeTodos.length} />
				<StatsCard label={dict.stats.completed} value={completed} />
				<StatsCard label={dict.stats.overdue} value={overdue} />
				<StatsCard
					label={dict.stats.completion_rate}
					value={`${completionRate}%`}
				/>
			</div>

			{/* Grafici riga 1 */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Donut per stato */}
				<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-4 font-medium text-gray-700 dark:text-gray-300">
						{dict.stats.by_status}
					</h3>
					<ResponsiveContainer width="100%" height={240}>
						<PieChart>
							<Pie
								data={byStatus}
								cx="50%"
								cy="50%"
								innerRadius={55}
								outerRadius={85}
								paddingAngle={2}
								dataKey="value"
								nameKey="name"
							>
								{byStatus.map((entry) => (
									<Cell key={entry.name} fill={entry.color} />
								))}
							</Pie>
							<Tooltip
								formatter={(value, name) => [value, sl(name as string)]}
							/>
							<Legend
								formatter={(value) => sl(value)}
								wrapperStyle={{ fontSize: 12 }}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Bar per priorità */}
				<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-4 font-medium text-gray-700 dark:text-gray-300">
						{dict.stats.by_priority}
					</h3>
					<ResponsiveContainer width="100%" height={240}>
						<BarChart
							data={byPriority}
							margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke={gridStroke}
								vertical={false}
							/>
							<XAxis
								dataKey="name"
								tick={{ fill: tickFill, fontSize: 12 }}
								tickFormatter={pl}
							/>
							<YAxis
								tick={{ fill: tickFill, fontSize: 12 }}
								allowDecimals={false}
							/>
							<Tooltip
								labelFormatter={(label) => pl(String(label ?? ''))}
								formatter={(value) => [value, dict.stats.tasks_count]}
							/>
							<Bar dataKey="value" radius={[4, 4, 0, 0]}>
								{byPriority.map((entry) => (
									<Cell key={entry.name} fill={entry.color} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Line chart tendenza */}
			<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
				<h3 className="mb-4 font-medium text-gray-700 dark:text-gray-300">
					{dict.stats.over_time}
				</h3>
				<ResponsiveContainer width="100%" height={200}>
					<LineChart
						data={overTime}
						margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
						<XAxis dataKey="date" tick={{ fill: tickFill, fontSize: 11 }} />
						<YAxis
							tick={{ fill: tickFill, fontSize: 11 }}
							allowDecimals={false}
						/>
						<Tooltip />
						<Legend wrapperStyle={{ fontSize: 12 }} />
						<Line
							type="monotone"
							dataKey="created"
							name={dict.stats.created}
							stroke="#60a5fa"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="completed"
							name={dict.stats.completed}
							stroke="#22c55e"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}

export default TasksStats
