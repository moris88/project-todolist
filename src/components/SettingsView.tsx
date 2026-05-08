import { useAtom, useAtomValue } from 'jotai'
import { HiMoon, HiSun } from 'react-icons/hi2'

import { darkModeAtom, dictAtom, languageAtom } from '@/atoms'
import { Switch } from '@/components/UI'
import { dicts, type Language } from '@/utils/constants'

import DangerZone from './DangerZone'

const languages: { value: Language; label: string; flag: string }[] = [
	{ value: 'it', label: 'Italiano', flag: '🇮🇹' },
	{ value: 'en', label: 'English', flag: '🇬🇧' },
]

function SettingsView() {
	const [language, setLanguage] = useAtom(languageAtom)
	const [darkMode, setDarkMode] = useAtom(darkModeAtom)
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

			{/* Import/Export + Danger Zone */}
			<DangerZone />
		</div>
	)
}

export default SettingsView
