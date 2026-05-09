import { useAtomValue } from 'jotai'
import React from 'react'
import { dictAtom } from '@/atoms'
import ProjectsStats from './stats/ProjectsStats'
import SprintsStats from './stats/SprintsStats'
import TasksStats from './stats/TasksStats'

type StatsSubView = 'tasks' | 'projects' | 'sprints'

function StatsView() {
	const dict = useAtomValue(dictAtom)
	const [active, setActive] = React.useState<StatsSubView>('tasks')

	const tabs: { key: StatsSubView; label: string }[] = [
		{ key: 'tasks', label: dict.nav.tasks },
		{ key: 'projects', label: dict.nav.projects },
		{ key: 'sprints', label: dict.nav.sprints },
	]

	return (
		<div className="py-4">
			<div className="mb-6 flex gap-1 border-gray-200 border-b dark:border-gray-700">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActive(tab.key)}
						className={`cursor-pointer px-4 py-2 font-medium text-sm transition-colors ${
							active === tab.key
								? 'border-blue-500 border-b-2 text-blue-600 dark:text-blue-400'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{active === 'tasks' && <TasksStats />}
			{active === 'projects' && <ProjectsStats />}
			{active === 'sprints' && <SprintsStats />}
		</div>
	)
}

export default StatsView
