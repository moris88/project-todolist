import { useAtomValue } from 'jotai'
import React from 'react'
import { HiArrowDownTray, HiArrowUpTray } from 'react-icons/hi2'

import { dictAtom } from '@/atoms'
import { ConfirmModal } from '@/components'
import { Button, ButtonGroup, Switch } from '@/components/UI'
import type { Comment, Todo } from '@/types'
import {
	clearTodosCompleted,
	clearTodosExpired,
	exportCommentsToCSV,
	exportToCSV,
	mergeCommentsStorage,
	parseCommentsCSV,
	parseCSV,
	removeAllTodos,
	updateTodoStorage,
} from '@/utils'

interface DangerZoneProps {
	todos: Todo[]
	setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
	comments: Comment[]
	setComments: React.Dispatch<React.SetStateAction<Comment[]>>
}

function DangerZone({
	todos,
	setTodos,
	comments,
	setComments,
}: DangerZoneProps) {
	const dict = useAtomValue(dictAtom)
	const [showDangerZone, setShowDangerZone] = React.useState(false)
	const [showInportExport, setShowImportExport] = React.useState(false)
	const todosFileRef = React.useRef<HTMLInputElement>(null)
	const commentsFileRef = React.useRef<HTMLInputElement>(null)
	const [showDeleteModal, setShowDeleteModal] = React.useState<{
		completed: boolean
		expired: boolean
		all: boolean
	}>({ completed: false, expired: false, all: false })

	const csv = dict.todolist.listitem.filter.csv

	const handleImportTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = (ev) => {
			try {
				const imported = parseCSV(ev.target?.result as string)
				if (imported.length > 0) {
					const existingIds = new Set(todos.map((t) => t.id))
					const toAdd = imported.filter((t) => !existingIds.has(t.id))
					const merged = [...todos, ...toAdd]
					setTodos(updateTodoStorage(merged))
					localStorage.setItem('todos', JSON.stringify(merged.map((t) => t.id)))
					alert(csv.success)
				}
			} catch {
				alert(csv.error)
			}
		}
		reader.readAsText(file)
		e.target.value = ''
	}

	const handleImportComments = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = (ev) => {
			try {
				const imported = parseCommentsCSV(ev.target?.result as string)
				if (imported.length > 0) {
					setComments(mergeCommentsStorage(imported, comments))
					alert(csv.success_comments)
				}
			} catch {
				alert(csv.error_comments)
			}
		}
		reader.readAsText(file)
		e.target.value = ''
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

	return (
		<div className="flex w-full flex-col gap-6 pb-12">
			<div className="flex w-full flex-col gap-4 border-gray-200 border-t pt-4 lg:flex-row lg:items-center lg:justify-between dark:border-gray-700">
				<Switch
					checked={showInportExport}
					color="default"
					size="sm"
					onChange={(e) => setShowImportExport(e.target.checked)}
				>
					<span className="font-bold text-black dark:text-blue-500">
						Inport/Export
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
				className={`${showInportExport ? 'rounded-lg bg-blue-200 p-1 hover:shadow-blue-500 hover:shadow-lg md:p-5' : ''}`}
			>
				{/* CSV section */}
				{showInportExport && (
					<div className="flex w-full flex-col items-center justify-center">
						<p className="py-5 font-bold text-black">
							{dict.todolist.listitem.filter.buttons.message}
						</p>
						<div className="flex flex-col gap-1.5">
							{/* Tasks row */}
							<div className="flex w-full items-center justify-center gap-2">
								<span className="w-20 shrink-0 text-right font-medium text-blue-500 text-xs">
									{csv.section_tasks}
								</span>
								<Button
									size="sm"
									variant="secondary"
									onPress={() => exportToCSV(todos)}
								>
									<HiArrowDownTray className="mr-1 h-3.5 w-3.5" />
									CSV
								</Button>
								<Button
									size="sm"
									variant="secondary"
									onPress={() => todosFileRef.current?.click()}
								>
									<HiArrowUpTray className="mr-1 h-3.5 w-3.5" />
									CSV
								</Button>
							</div>
							{/* Comments row */}
							<div className="flex w-full items-center justify-center gap-2">
								<span className="w-20 shrink-0 text-right font-medium text-blue-500 text-xs">
									{csv.section_comments}
								</span>
								<Button
									size="sm"
									variant="secondary"
									onPress={() => exportCommentsToCSV(comments)}
								>
									<HiArrowDownTray className="mr-1 h-3.5 w-3.5" />
									CSV
								</Button>
								<Button
									size="sm"
									variant="secondary"
									onPress={() => commentsFileRef.current?.click()}
								>
									<HiArrowUpTray className="mr-1 h-3.5 w-3.5" />
									CSV
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Hidden file inputs */}
				<input
					ref={todosFileRef}
					accept=".csv"
					className="hidden"
					type="file"
					onChange={handleImportTodos}
				/>
				<input
					ref={commentsFileRef}
					accept=".csv"
					className="hidden"
					type="file"
					onChange={handleImportComments}
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
			</div>

			{Object.keys(showDeleteModal).map((key) => (
				<ConfirmModal
					key={key}
					buttonCancel={dict.todolist.deleteTask.cancel}
					buttonConfirm={dict.todolist.deleteTask.delete}
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
		</div>
	)
}

export default DangerZone
