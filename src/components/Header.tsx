import { useAtom } from 'jotai'
import { HiMoon, HiSun } from 'react-icons/hi2'

import { darkModeAtom, languageAtom } from '@/atoms'
import { dicts, Language } from '@/utils/constants'

const languages: { value: Language; label: string; flag: string }[] = [
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
]

function Header() {
  const [language, setLanguage] = useAtom(languageAtom)
  const [darkMode, setDarkMode] = useAtom(darkModeAtom)

  return (
    <header className="flex flex-col items-center justify-center gap-y-2 border-b border-gray-200 px-5 py-2 dark:border-gray-700 sm:flex-row sm:justify-between lg:px-20">
      <div>
        <h1 className="text-center text-lg font-bold text-gray-800 dark:text-gray-100 sm:text-left">
          {dicts[language].title}
        </h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 sm:text-left">
          {dicts[language].subtitle}
        </p>
      </div>
      <div className="flex items-center justify-end gap-3">
        <select
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#2a2927] dark:text-gray-200"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>

        <button
          aria-label="Toggle dark mode"
          className="flex items-center justify-center rounded-md border border-gray-300 p-1.5 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? (
            <HiSun className="h-4 w-4" />
          ) : (
            <HiMoon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
