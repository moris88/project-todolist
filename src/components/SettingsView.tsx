import { useAtom, useAtomValue } from 'jotai'
import { HiFlag, HiMoon, HiSun } from 'react-icons/hi2'

import {
	darkModeAtom,
	dictAtom,
	languageAtom,
	maxActiveSprintsAtom,
	type ProjectLimits,
	projectLimitsAtom,
} from '@/atoms'
import { Switch } from '@/components/UI'
import type { Priority } from '@/types'
import { dicts, type Language } from '@/utils/constants'

import DangerZone from './DangerZone'

const languages: { value: Language; label: string; flag: string }[] = [
	{ value: 'it', label: 'Italiano', flag: '🇮🇹' },
	{ value: 'en', label: 'English', flag: '🇬🇧' },
]

const priorityRows: { key: Priority; flagClass: string }[] = [
	{ key: 'urgent', flagClass: 'text-red-600' },
	{ key: 'high', flagClass: 'text-yellow-500' },
	{ key: 'medium', flagClass: 'text-gray-400' },
	{ key: 'low', flagClass: 'text-green-600' },
]

function SettingsView() {
	const [language, setLanguage] = useAtom(languageAtom)
	const [darkMode, setDarkMode] = useAtom(darkModeAtom)
	const [limits, setLimits] = useAtom(projectLimitsAtom)
	const [maxSprints, setMaxSprints] = useAtom(maxActiveSprintsAtom)
	const dict = useAtomValue(dictAtom)

	return (
		<div className="mt-4 space-y-5 pb-12">
			<h2 className="font-bold text-gray-800 text-xl dark:text-gray-100">
				{dict.settings.title}
			</h2>

			{/* Language */}
			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
					{dict.settings.language}
				</h3>
				<select
					className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
					value={language}
					onChange={(e) => setLanguage(e.target.value as Language)}
				>
					{languages.map((lang) => (
						<option key={lang.value} value={lang.value}>
							{lang.flag} {dicts[lang.value].title}
						</option>
					))}
				</select>
			</div>

			{/* Theme */}
			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<h3 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
					{dict.settings.theme}
				</h3>
				<div className="flex items-center gap-3">
					<Switch
						checked={darkMode}
						size="sm"
						onChange={(e) => setDarkMode(e.target.checked)}
					>
						{dict.settings.theme_dark}
					</Switch>
					{darkMode ? (
						<HiMoon className="h-4 w-4 text-blue-400" />
					) : (
						<HiSun className="h-4 w-4 text-yellow-500" />
					)}
				</div>
			</div>

			{/* Project limits */}
			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<h3 className="mb-1 font-semibold text-gray-700 dark:text-gray-300">
					{dict.settings.project_limits}
				</h3>
				<p className="mb-4 text-gray-400 text-xs">
					{dict.settings.project_limits_desc}
				</p>
				<div className="flex flex-col gap-3">
					{priorityRows.map(({ key, flagClass }) => (
						<div key={key} className="flex items-center gap-3">
							<HiFlag className={`h-4 w-4 shrink-0 ${flagClass}`} />
							<span className="w-24 text-gray-700 text-sm capitalize dark:text-gray-300">
								{dict.todolist.listitem.priority.items[key]}
							</span>
							<input
								className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
								max={99}
								min={0}
								type="number"
								value={limits[key]}
								onChange={(e) =>
									setLimits((prev: ProjectLimits) => ({
										...prev,
										[key]: Math.max(0, Number(e.target.value)),
									}))
								}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Max active sprints */}
			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<h3 className="mb-1 font-semibold text-gray-700 dark:text-gray-300">
					{dict.settings.max_active_sprints}
				</h3>
				<p className="mb-4 text-gray-400 text-xs">
					{dict.settings.max_active_sprints_desc}
				</p>
				<input
					className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
					max={99}
					min={1}
					type="number"
					value={maxSprints}
					onChange={(e) => setMaxSprints(Math.max(1, Number(e.target.value)))}
				/>
			</div>

			{/* Import/Export + Danger Zone */}
			<DangerZone />
		</div>
	)
}

export default SettingsView
