import { useAtomValue } from 'jotai'
import React from 'react'
import {
	Bar,
	BarChart,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { darkModeAtom, dictAtom, projectsAtom, todoListAtom } from '@/atoms'
import {
	getActiveTodos,
	getProjectStats,
	getProjectsByStatus,
} from '@/utils/stats'
import StatsCard from './StatsCard'

function ProjectsStats() {
	const projects = useAtomValue(projectsAtom)
	const todos = useAtomValue(todoListAtom)
	const dict = useAtomValue(dictAtom)
	const darkMode = useAtomValue(darkModeAtom)

	const tickFill = darkMode ? '#9ca3af' : '#4b5563'
	const gridStroke = darkMode ? '#374151' : '#e5e7eb'

	const activeTodos = React.useMemo(() => getActiveTodos(todos), [todos])
	const projectStats = React.useMemo(
		() => getProjectStats(projects, activeTodos),
		[projects, activeTodos],
	)
	const byStatus = React.useMemo(
		() => getProjectsByStatus(projects),
		[projects],
	)

	const active = projects.filter((p) => p.status === 'active').length
	const completed = projects.filter((p) => p.status === 'completed').length
	const paused = projects.filter((p) => p.status === 'paused').length

	const projectStatusLabels: Record<string, string> = {
		active: dict.projects.status_items.active,
		completed: dict.projects.status_items.completed,
		archived: dict.projects.status_items.archived,
		paused: dict.projects.status_items.paused,
	}
	const psl = (key: string) => projectStatusLabels[key] ?? key

	const taskBarData = projectStats
		.filter((p) => p.total > 0)
		.sort((a, b) => b.total - a.total)
		.slice(0, 8)
		.map((p) => ({ name: p.name, tasks: p.total, color: p.color }))

	if (projects.length === 0) {
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
				<StatsCard label={dict.stats.total} value={projects.length} />
				<StatsCard label={dict.stats.active} value={active} />
				<StatsCard label={dict.stats.completed} value={completed} />
				<StatsCard label={dict.projects.status_items.paused} value={paused} />
			</div>

			{/* Grafici riga 1 */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Donut per stato progetto */}
				<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-4 font-medium text-gray-700 dark:text-gray-300">
						{dict.projects.status}
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
								formatter={(value, name) => [value, psl(name as string)]}
							/>
							<Legend
								formatter={(value) => psl(value)}
								wrapperStyle={{ fontSize: 12 }}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Horizontal bar task per progetto */}
				{taskBarData.length > 0 && (
					<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
						<h3 className="mb-4 font-medium text-gray-700 dark:text-gray-300">
							{dict.stats.per_project}
						</h3>
						<ResponsiveContainer width="100%" height={240}>
							<BarChart
								layout="vertical"
								data={taskBarData}
								margin={{ top: 0, right: 16, bottom: 0, left: 4 }}
							>
								<XAxis
									type="number"
									tick={{ fill: tickFill, fontSize: 11 }}
									allowDecimals={false}
									stroke={gridStroke}
								/>
								<YAxis
									type="category"
									dataKey="name"
									width={120}
									tick={{ fill: tickFill, fontSize: 11 }}
									tickFormatter={(v: string) =>
										v.length > 14 ? `${v.slice(0, 14)}…` : v
									}
								/>
								<Tooltip
									formatter={(value) => [value, dict.stats.tasks_count]}
								/>
								<Bar dataKey="tasks" radius={[0, 4, 4, 0]}>
									{taskBarData.map((entry) => (
										<Cell key={entry.name} fill={entry.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				)}
			</div>

			{/* Progress bars completamento */}
			{projectStats.some((p) => p.total > 0) && (
				<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-4 font-medium text-gray-700 dark:text-gray-300">
						{dict.stats.completion_pct}
					</h3>
					<div className="space-y-3">
						{projectStats
							.filter((p) => p.total > 0)
							.sort((a, b) => b.completionRate - a.completionRate)
							.map((p) => (
								<div key={p.id}>
									<div className="flex items-center justify-between text-sm">
										<span
											className="truncate font-medium text-gray-700 dark:text-gray-300"
											title={p.name}
										>
											{p.name}
										</span>
										<span className="ml-3 shrink-0 text-gray-500 dark:text-gray-400">
											{p.done}/{p.total} ({p.completionRate}%)
										</span>
									</div>
									<div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
										<div
											className="h-full rounded-full transition-all duration-500"
											style={{
												width: `${p.completionRate}%`,
												backgroundColor: p.color,
											}}
										/>
									</div>
								</div>
							))}
					</div>
				</div>
			)}
		</div>
	)
}

export default ProjectsStats
