import { useAtomValue } from 'jotai'
import { HiBell } from 'react-icons/hi2'

import {
	dictAtom,
	projectsAtom,
	sprintsAtom,
	todoListAtom,
	trashAtom,
} from '@/atoms'

function Header() {
	const dict = useAtomValue(dictAtom)
	const todos = useAtomValue(todoListAtom)
	const projects = useAtomValue(projectsAtom)
	const sprints = useAtomValue(sprintsAtom)
	const trash = useAtomValue(trashAtom)

	const activeTasks = todos.filter((t) => !t.completed && !t.deletedAt).length
	const activeProjects = projects.filter((p) => p.status === 'active').length
	const activeSprints = sprints.filter((s) => s.status === 'active').length
	const trashCount = trash.length

	const endOfToday = new Date()
	endOfToday.setHours(23, 59, 59, 999)
	const alertCount = todos.filter((t) => {
		if (t.completed || t.deletedAt || !t.dueDate) return false
		return new Date(t.dueDate) <= endOfToday
	}).length

	return (
		<header className="border-gray-200 border-b px-5 py-2 lg:px-20 dark:border-gray-700">
			<div className="flex items-center justify-between">
				<div className="flex w-full flex-col items-center justify-between md:flex-row">
					<div className="flex flex-col gap-1">
						<h1 className="text-center font-bold text-gray-800 text-xl md:text-start dark:text-gray-100">
							{dict.title}
						</h1>
						<p className="text-gray-500 text-sm italic dark:text-gray-400">
							{dict.subtitle}
						</p>
					</div>
					<div>
						<p>By Maurizio Tolomeo</p>
					</div>
				</div>
				{alertCount > 0 && (
					<div
						className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-red-600 dark:bg-red-900/30 dark:text-red-400"
						title={dict.header.notifications}
					>
						<HiBell className="h-4 w-4" />
						<span className="font-semibold text-sm">{alertCount}</span>
					</div>
				)}
			</div>

			{/* Counters */}
			<div className="mt-1 flex flex-wrap justify-center gap-3 border-gray-100 border-t pt-2 sm:justify-start dark:border-gray-700/50">
				<span className="flex items-center gap-1.5 text-gray-500 text-xs dark:text-gray-400">
					<span className="h-2 w-2 rounded-full bg-blue-500" />
					{dict.header.active_tasks}:
					<span className="font-semibold text-gray-700 dark:text-gray-200">
						{activeTasks}
					</span>
				</span>
				<span className="flex items-center gap-1.5 text-gray-500 text-xs dark:text-gray-400">
					<span className="h-2 w-2 rounded-full bg-green-500" />
					{dict.header.active_projects}:
					<span className="font-semibold text-gray-700 dark:text-gray-200">
						{activeProjects}
					</span>
				</span>
				<span className="flex items-center gap-1.5 text-gray-500 text-xs dark:text-gray-400">
					<span className="h-2 w-2 rounded-full bg-purple-500" />
					{dict.header.active_sprints}:
					<span className="font-semibold text-gray-700 dark:text-gray-200">
						{activeSprints}
					</span>
				</span>
				{trashCount > 0 && (
					<span className="flex items-center gap-1.5 text-gray-500 text-xs dark:text-gray-400">
						<span className="h-2 w-2 rounded-full bg-red-400" />
						{dict.trash.title}:
						<span className="font-semibold text-red-500 dark:text-red-400">
							{trashCount}
						</span>
					</span>
				)}
			</div>
		</header>
	)
}

export default Header
