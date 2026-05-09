import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import {
	HiArchiveBox,
	HiCalendarDays,
	HiClipboardDocumentList,
	HiCog6Tooth,
	HiMiniTrash,
	HiRectangleStack,
} from 'react-icons/hi2'
import type { ActiveView } from '@/atoms'
import { activeViewAtom, darkModeAtom, dictAtom, trashAtom } from '@/atoms'
import CalendarView from '@/components/CalendarView'
import Header from '@/components/Header'
import ProjectsManager from '@/components/ProjectsManager'
import SettingsView from '@/components/SettingsView'
import SprintsManager from '@/components/SprintsManager'
import TrashView from '@/components/TrashView'

interface WrapperProps {
	children: React.ReactNode
}

function Wrapper({ children }: WrapperProps) {
	const darkMode = useAtomValue(darkModeAtom)
	const [activeView, setActiveView] = useAtom(activeViewAtom)
	const dict = useAtomValue(dictAtom)
	const trash = useAtomValue(trashAtom)

	React.useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [darkMode])

	const navItems: { key: ActiveView; label: string; icon: React.ReactNode }[] =
		[
			{
				key: 'tasks',
				label: dict.nav.tasks,
				icon: <HiClipboardDocumentList className="h-4 w-4" />,
			},
			{
				key: 'projects',
				label: dict.nav.projects,
				icon: <HiRectangleStack className="h-4 w-4" />,
			},
			{
				key: 'sprints',
				label: dict.nav.sprints,
				icon: <HiArchiveBox className="h-4 w-4" />,
			},
			{
				key: 'calendar',
				label: dict.nav.calendar,
				icon: <HiCalendarDays className="h-4 w-4" />,
			},
			{
				key: 'trash',
				label: dict.nav.trash,
				icon: (
					<span className="relative">
						<HiMiniTrash className="h-4 w-4" />
						{trash.length > 0 && (
							<span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 font-bold text-[9px] text-white">
								{trash.length > 9 ? '9+' : trash.length}
							</span>
						)}
					</span>
				),
			},
			{
				key: 'settings',
				label: dict.nav.settings,
				icon: <HiCog6Tooth className="h-4 w-4" />,
			},
		]

	return (
		<div className="min-h-screen bg-white dark:bg-[#1b1a19] dark:text-white">
			<Header />
			<div className="container">
				{/* Tab navigation */}
				<div className="mt-4 flex gap-1 overflow-x-auto border-gray-200 border-b pb-0 dark:border-gray-700">
					{navItems.map((item) => (
						<button
							key={item.key}
							className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-t-lg px-4 py-2 font-medium text-sm transition-colors ${
								activeView === item.key
									? 'border border-gray-200 border-b-white bg-white text-blue-600 dark:border-gray-700 dark:border-b-[#1b1a19] dark:bg-[#1b1a19] dark:text-blue-400'
									: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
							}`}
							type="button"
							onClick={() => setActiveView(item.key)}
						>
							{item.icon}
							{item.label}
						</button>
					))}
				</div>

				{activeView === 'tasks' && children}
				{activeView === 'projects' && <ProjectsManager />}
				{activeView === 'sprints' && <SprintsManager />}
				{activeView === 'calendar' && <CalendarView />}
				{activeView === 'trash' && <TrashView />}
				{activeView === 'settings' && <SettingsView />}
			</div>
		</div>
	)
}

export default Wrapper
