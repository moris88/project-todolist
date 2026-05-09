import { useAtomValue } from 'jotai'
import React from 'react'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { darkModeAtom, dictAtom, sprintsAtom, todoListAtom } from '@/atoms'
import {
	getActiveTodos,
	getSprintStats,
	getSprintsByStatus,
} from '@/utils/stats'
import StatsCard from './StatsCard'

function SprintsStats() {
	const sprints = useAtomValue(sprintsAtom)
	const todos = useAtomValue(todoListAtom)
	const dict = useAtomValue(dictAtom)
	const darkMode = useAtomValue(darkModeAtom)

	const tickFill = darkMode ? '#9ca3af' : '#4b5563'
	const gridStroke = darkMode ? '#374151' : '#e5e7eb'

	const activeTodos = React.useMemo(() => getActiveTodos(todos), [todos])
	const sprintStats = React.useMemo(
		() => getSprintStats(sprints, activeTodos),
		[sprints, activeTodos],
	)
	const byStatus = React.useMemo(() => getSprintsByStatus(sprints), [sprints])

	const active = sprints.filter((s) => s.status === 'active').length
	const completed = sprints.filter((s) => s.status === 'completed').length
	const avgVelocity =
		sprintStats.length > 0
			? Math.round(
					sprintStats.reduce((sum, s) => sum + s.completed, 0) /
						sprintStats.length,
				)
			: 0

	const sprintStatusLabels: Record<string, string> = {
		planning: dict.sprints.status_items.planning,
		active: dict.sprints.status_items.active,
		completed: dict.sprints.status_items.completed,
		cancelled: dict.sprints.status_items.cancelled,
	}
	const ssl = (key: string) => sprintStatusLabels[key] ?? key

	const velocityData = sprintStats.slice(-10).map((s) => ({
		name: s.name.length > 12 ? `${s.name.slice(0, 12)}…` : s.name,
		[dict.stats.completed]: s.completed,
		[dict.stats.total]: s.total,
	}))

	if (sprints.length === 0) {
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
				<StatsCard label={dict.stats.total} value={sprints.length} />
				<StatsCard label={dict.stats.active} value={active} />
				<StatsCard label={dict.stats.completed} value={completed} />
				<StatsCard label={dict.stats.avg_velocity} value={avgVelocity} />
			</div>

			{/* Grafici */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Donut per stato sprint */}
				<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-4 font-medium text-gray-700 dark:text-gray-300">
						{dict.sprints.status}
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
								formatter={(value, name) => [value, ssl(name as string)]}
							/>
							<Legend
								formatter={(value) => ssl(value)}
								wrapperStyle={{ fontSize: 12 }}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Bar velocity */}
				{velocityData.length > 0 && (
					<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
						<h3 className="mb-4 font-medium text-gray-700 dark:text-gray-300">
							{dict.stats.velocity}
						</h3>
						<ResponsiveContainer width="100%" height={240}>
							<BarChart
								data={velocityData}
								margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={gridStroke}
									vertical={false}
								/>
								<XAxis dataKey="name" tick={{ fill: tickFill, fontSize: 11 }} />
								<YAxis
									tick={{ fill: tickFill, fontSize: 11 }}
									allowDecimals={false}
								/>
								<Tooltip />
								<Legend wrapperStyle={{ fontSize: 12 }} />
								<Bar
									dataKey={dict.stats.completed}
									fill="#22c55e"
									radius={[4, 4, 0, 0]}
								/>
								<Bar
									dataKey={dict.stats.total}
									fill="#60a5fa"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				)}
			</div>
		</div>
	)
}

export default SprintsStats
