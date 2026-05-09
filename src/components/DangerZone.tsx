import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { HiArrowDownTray, HiArrowUpTray } from 'react-icons/hi2'

import {
	commentsAtom,
	darkModeAtom,
	dictAtom,
	languageAtom,
	maxActiveSprintsAtom,
	pageSizeAtom,
	projectLimitsAtom,
	projectsAtom,
	sprintsAtom,
	tagsAtom,
	todoListAtom,
} from '@/atoms'
import { ConfirmModal } from '@/components'
import { Button, ButtonGroup, Switch } from '@/components/UI'
import {
	clearTodosCompleted,
	clearTodosExpired,
	exportAllToJSON,
	exportProjectsToCSV,
	exportSprintsToCSV,
	exportToCSV,
	parseAppJSON,
	removeAllTodos,
	updateTodoStorage,
} from '@/utils'

function DangerZone() {
	const [todos, setTodos] = useAtom(todoListAtom)
	const [comments, setComments] = useAtom(commentsAtom)
	const [projects, setProjects] = useAtom(projectsAtom)
	const [sprints, setSprints] = useAtom(sprintsAtom)
	const [tags, setTags] = useAtom(tagsAtom)
	const [language, setLanguage] = useAtom(languageAtom)
	const [darkMode, setDarkMode] = useAtom(darkModeAtom)
	const [projectLimits, setProjectLimits] = useAtom(projectLimitsAtom)
	const [maxActiveSprints, setMaxActiveSprints] = useAtom(maxActiveSprintsAtom)
	const [pageSize, setPageSize] = useAtom(pageSizeAtom)
	const dict = useAtomValue(dictAtom)

	const [showDangerZone, setShowDangerZone] = React.useState(false)
	const [showImportExport, setShowImportExport] = React.useState(false)
	const [showConfirmImportJSON, setShowConfirmImportJSON] =
		React.useState(false)
	const [pendingJSONData, setPendingJSONData] = React.useState<ReturnType<
		typeof parseAppJSON
	> | null>(null)
	const jsonFileRef = React.useRef<HTMLInputElement>(null)

	const [showDeleteModal, setShowDeleteModal] = React.useState<{
		completed: boolean
		expired: boolean
		all: boolean
	}>({ completed: false, expired: false, all: false })

	const [showProjectModal, setShowProjectModal] = React.useState<{
		clear_completed_projects: boolean
		clear_all_projects: boolean
	}>({ clear_completed_projects: false, clear_all_projects: false })

	const [showSprintModal, setShowSprintModal] = React.useState<{
		clear_completed_sprints: boolean
		clear_all_sprints: boolean
	}>({ clear_completed_sprints: false, clear_all_sprints: false })

	const csv = dict.todolist.listitem.filter.csv

	const handleExportJSON = () => {
		exportAllToJSON({
			todos,
			projects,
			sprints,
			comments,
			settings: {
				language,
				darkMode,
				tags,
				projectLimits,
				maxActiveSprints,
				pageSize,
			},
		})
	}

	const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = (ev) => {
			try {
				const data = parseAppJSON(ev.target?.result as string)
				setPendingJSONData(data)
				setShowConfirmImportJSON(true)
			} catch {
				alert(csv.error_json)
			}
		}
		reader.readAsText(file)
		e.target.value = ''
	}

	const confirmImportJSON = () => {
		if (!pendingJSONData) return
		const d = pendingJSONData
		setTodos(updateTodoStorage(d.todos ?? []))
		setProjects(d.projects ?? [])
		setSprints(d.sprints ?? [])
		setComments(d.comments ?? [])
		if (d.settings) {
			if (d.settings.language) setLanguage(d.settings.language)
			if (d.settings.darkMode !== undefined) setDarkMode(d.settings.darkMode)
			if (d.settings.tags) setTags(d.settings.tags)
			if (d.settings.projectLimits) setProjectLimits(d.settings.projectLimits)
			if (d.settings.maxActiveSprints !== undefined)
				setMaxActiveSprints(d.settings.maxActiveSprints)
			if (d.settings.pageSize !== undefined) setPageSize(d.settings.pageSize)
		}
		setPendingJSONData(null)
		setShowConfirmImportJSON(false)
		alert(csv.success_json)
	}

	const buttons: {
		key: 'completed' | 'expired' | 'all'
		text: string
		message: string
	}[] = [
		{
			key: 'completed',
			text: dict.todolist.listitem.filter.buttons.clear_completed.label,
			message: dict.todolist.listitem.filter.buttons.clear_completed.message,
		},
		{
			key: 'expired',
			text: dict.todolist.listitem.filter.buttons.clear_expired.label,
			message: dict.todolist.listitem.filter.buttons.clear_expired.message,
		},
		{
			key: 'all',
			text: dict.todolist.listitem.filter.buttons.clear_all.label,
			message: dict.todolist.listitem.filter.buttons.clear_all.message,
		},
	]

	const projectButtons: {
		key: keyof typeof showProjectModal
		text: string
		message: string
	}[] = [
		{
			key: 'clear_completed_projects',
			text: dict.todolist.listitem.filter.buttons.clear_completed_projects
				.label,
			message:
				dict.todolist.listitem.filter.buttons.clear_completed_projects.message,
		},
		{
			key: 'clear_all_projects',
			text: dict.todolist.listitem.filter.buttons.clear_all_projects.label,
			message: dict.todolist.listitem.filter.buttons.clear_all_projects.message,
		},
	]

	const sprintButtons: {
		key: keyof typeof showSprintModal
		text: string
		message: string
	}[] = [
		{
			key: 'clear_completed_sprints',
			text: dict.todolist.listitem.filter.buttons.clear_completed_sprints.label,
			message:
				dict.todolist.listitem.filter.buttons.clear_completed_sprints.message,
		},
		{
			key: 'clear_all_sprints',
			text: dict.todolist.listitem.filter.buttons.clear_all_sprints.label,
			message: dict.todolist.listitem.filter.buttons.clear_all_sprints.message,
		},
	]

	const csvRows: { key: string; label: string; onExport: () => void }[] = [
		{
			key: 'tasks',
			label: csv.section_tasks,
			onExport: () => exportToCSV(todos),
		},
		{
			key: 'projects',
			label: csv.section_projects,
			onExport: () => exportProjectsToCSV(projects),
		},
		{
			key: 'sprints',
			label: csv.section_sprints,
			onExport: () => exportSprintsToCSV(sprints),
		},
	]

	return (
		<div className="flex w-full flex-col gap-6 pb-12">
			<div className="flex w-full flex-col gap-4 border-gray-200 border-t pt-4 lg:flex-row lg:items-center lg:justify-between dark:border-gray-700">
				<Switch
					checked={showImportExport}
					color="default"
					size="sm"
					onChange={(e) => setShowImportExport(e.target.checked)}
				>
					<span className="font-bold text-black dark:text-blue-500">
						Import/Export
					</span>
				</Switch>
				<Switch
					checked={showDangerZone}
					color="danger"
					size="sm"
					onChange={(e) => setShowDangerZone(e.target.checked)}
				>
					<span className="font-bold text-red-600">Danger Zone</span>
				</Switch>
			</div>

			<div
				className={`${showImportExport ? 'rounded-lg bg-blue-200 p-1 hover:shadow-blue-500 hover:shadow-lg md:p-5' : ''}`}
			>
				{showImportExport && (
					<div className="flex w-full flex-col items-center justify-center gap-4">
						<p className="pt-2 font-bold text-black">
							{dict.todolist.listitem.filter.buttons.message}
						</p>

						<div className="flex flex-col gap-1.5">
							{csvRows.map(({ key, label, onExport }) => (
								<div
									key={key}
									className="flex w-full items-center justify-center gap-2"
								>
									<span className="w-20 shrink-0 text-right font-medium text-blue-500 text-xs">
										{label}
									</span>
									<Button size="sm" variant="secondary" onPress={onExport}>
										<HiArrowDownTray className="mr-1 h-3.5 w-3.5" />
										CSV
									</Button>
								</div>
							))}

							{/* JSON export + import */}
							<div className="mt-1 flex w-full items-center justify-center gap-2 border-blue-300 border-t pt-2">
								<span className="w-20 shrink-0 text-right font-medium text-blue-500 text-xs">
									{csv.section_json}
								</span>
								<Button
									size="sm"
									variant="secondary"
									onPress={handleExportJSON}
								>
									<HiArrowDownTray className="mr-1 h-3.5 w-3.5" />
									JSON
								</Button>
								<Button
									size="sm"
									variant="secondary"
									onPress={() => jsonFileRef.current?.click()}
								>
									<HiArrowUpTray className="mr-1 h-3.5 w-3.5" />
									JSON
								</Button>
							</div>
						</div>
					</div>
				)}

				<input
					ref={jsonFileRef}
					accept=".json"
					className="hidden"
					type="file"
					onChange={handleImportJSON}
				/>
			</div>

			<div
				className={`${showDangerZone ? 'rounded-lg bg-red-200 p-1 hover:shadow-lg hover:shadow-red-500 md:p-5' : ''}`}
			>
				{showDangerZone && todos.length > 0 && (
					<>
						<div className="hidden w-full flex-col items-center justify-center md:flex">
							<p className="py-5 font-bold text-black">
								{dict.todolist.listitem.filter.buttons.message}
							</p>
							<p className="mb-5 text-center text-red-500 text-sm italic dark:text-red-400">
								{dict.todolist.listitem.filter.buttons.description}
							</p>
							<ButtonGroup>
								{buttons.map((button) => (
									<Button
										key={button.key}
										size="lg"
										variant="primary"
										onPress={() =>
											setShowDeleteModal({
												...showDeleteModal,
												[button.key]: true,
											})
										}
									>
										{button.text}
									</Button>
								))}
							</ButtonGroup>
						</div>
						<div className="my-10 flex w-full flex-col items-center justify-center gap-y-2 md:hidden">
							<p className="py-5 font-bold text-black">
								{dict.todolist.listitem.filter.buttons.message}
							</p>
							{buttons.map((button) => (
								<Button
									key={button.key}
									size="sm"
									variant="primary"
									onPress={() =>
										setShowDeleteModal({
											...showDeleteModal,
											[button.key]: true,
										})
									}
								>
									{button.text}
								</Button>
							))}
						</div>
					</>
				)}

				{showDangerZone && todos.length === 0 && (
					<p className="py-5 text-center font-bold text-gray-500 dark:text-gray-400">
						{dict.todolist.listitem.filter.buttons.no_tasks}
					</p>
				)}

				{/* Projects danger buttons */}
				{showDangerZone && (projects.length > 0 || sprints.length > 0) && (
					<div className="mt-4 flex flex-col items-center gap-2 border-red-300 border-t pt-4">
						{projects.length > 0 && (
							<div className="flex flex-wrap justify-center gap-2">
								{projectButtons.map((btn) => (
									<Button
										key={btn.key}
										size="sm"
										variant="primary"
										onPress={() =>
											setShowProjectModal({
												...showProjectModal,
												[btn.key]: true,
											})
										}
									>
										{btn.text}
									</Button>
								))}
							</div>
						)}
						{sprints.length > 0 && (
							<div className="flex flex-wrap justify-center gap-2">
								{sprintButtons.map((btn) => (
									<Button
										key={btn.key}
										size="sm"
										variant="primary"
										onPress={() =>
											setShowSprintModal({
												...showSprintModal,
												[btn.key]: true,
											})
										}
									>
										{btn.text}
									</Button>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{Object.keys(showDeleteModal).map((key) => (
				<ConfirmModal
					key={key}
					buttonCancel={dict.todolist.deleteTask.cancel}
					buttonConfirm={dict.todolist.listitem.delete}
					description={buttons.find((b) => b.key === key)?.message ?? ''}
					isOpen={showDeleteModal[key as keyof typeof showDeleteModal]}
					title={buttons.find((b) => b.key === key)?.text ?? ''}
					onCancel={() =>
						setShowDeleteModal({ ...showDeleteModal, [key]: false })
					}
					onConfirm={() => {
						switch (key) {
							case 'completed':
								setTodos(clearTodosCompleted(todos))
								break
							case 'expired':
								setTodos(clearTodosExpired(todos))
								break
							case 'all':
								setTodos(removeAllTodos())
								break
						}
						setShowDangerZone(false)
						setShowDeleteModal({ ...showDeleteModal, [key]: false })
					}}
				/>
			))}

			{Object.keys(showProjectModal).map((key) => (
				<ConfirmModal
					key={key}
					buttonCancel={dict.todolist.deleteTask.cancel}
					buttonConfirm={dict.todolist.listitem.delete}
					description={projectButtons.find((b) => b.key === key)?.message ?? ''}
					isOpen={showProjectModal[key as keyof typeof showProjectModal]}
					title={projectButtons.find((b) => b.key === key)?.text ?? ''}
					onCancel={() =>
						setShowProjectModal({ ...showProjectModal, [key]: false })
					}
					onConfirm={() => {
						if (key === 'clear_completed_projects') {
							const completedIds = new Set(
								projects
									.filter((p) => p.status === 'completed')
									.map((p) => p.id),
							)
							setProjects((prev) => prev.filter((p) => !completedIds.has(p.id)))
							setSprints((prev) =>
								prev.filter(
									(s) => !s.projectId || !completedIds.has(s.projectId),
								),
							)
						} else if (key === 'clear_all_projects') {
							setProjects([])
							setSprints([])
						}
						setShowDangerZone(false)
						setShowProjectModal({ ...showProjectModal, [key]: false })
					}}
				/>
			))}

			{Object.keys(showSprintModal).map((key) => (
				<ConfirmModal
					key={key}
					buttonCancel={dict.todolist.deleteTask.cancel}
					buttonConfirm={dict.todolist.listitem.delete}
					description={sprintButtons.find((b) => b.key === key)?.message ?? ''}
					isOpen={showSprintModal[key as keyof typeof showSprintModal]}
					title={sprintButtons.find((b) => b.key === key)?.text ?? ''}
					onCancel={() =>
						setShowSprintModal({ ...showSprintModal, [key]: false })
					}
					onConfirm={() => {
						if (key === 'clear_completed_sprints') {
							setSprints((prev) => prev.filter((s) => s.status !== 'completed'))
						} else if (key === 'clear_all_sprints') {
							setSprints([])
						}
						setShowDangerZone(false)
						setShowSprintModal({ ...showSprintModal, [key]: false })
					}}
				/>
			))}

			<ConfirmModal
				buttonCancel={dict.sprints.cancel}
				buttonConfirm={csv.import_json}
				description={csv.confirm_import_json}
				isOpen={showConfirmImportJSON}
				title={csv.import_json}
				onCancel={() => {
					setShowConfirmImportJSON(false)
					setPendingJSONData(null)
				}}
				onConfirm={confirmImportJSON}
			/>
		</div>
	)
}

export default DangerZone
