import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { HiArrowUturnLeft, HiMiniTrash } from 'react-icons/hi2'

import {
	commentsAtom,
	deletedProjectsAtom,
	deletedSprintsAtom,
	dictAtom,
	projectsAtom,
	sprintsAtom,
	todoListAtom,
	trashAtom,
} from '@/atoms'
import { ConfirmModal } from '@/components'
import { Button, Chip } from '@/components/UI'
import { addTodoStorage, DATE_FORMAT, removeCommentsByTodoId } from '@/utils'

function TrashView() {
	const [trash, setTrash] = useAtom(trashAtom)
	const [todos, setTodos] = useAtom(todoListAtom)
	const [comments, setComments] = useAtom(commentsAtom)
	const [deletedProjects, setDeletedProjects] = useAtom(deletedProjectsAtom)
	const [deletedSprints, setDeletedSprints] = useAtom(deletedSprintsAtom)
	const [, setProjects] = useAtom(projectsAtom)
	const [, setSprints] = useAtom(sprintsAtom)
	const dict = useAtomValue(dictAtom)
	const [deleteId, setDeleteId] = React.useState<string | null>(null)
	const [emptyConfirm, setEmptyConfirm] = React.useState(false)
	const [deleteProjectId, setDeleteProjectId] = React.useState<string | null>(
		null,
	)
	const [deleteSprintId, setDeleteSprintId] = React.useState<string | null>(
		null,
	)

	const restoreTodo = (id: string) => {
		const item = trash.find((t) => t.id === id)
		if (!item) return
		const restored = { ...item, deletedAt: null }
		setTrash((prev) => prev.filter((t) => t.id !== id))
		setTodos(addTodoStorage(restored, todos))
	}

	const deletePermanently = (id: string) => {
		setTrash((prev) => prev.filter((t) => t.id !== id))
		setComments(removeCommentsByTodoId(id, comments))
		setDeleteId(null)
	}

	const emptyTrash = () => {
		for (const item of trash) {
			setComments((prev) => removeCommentsByTodoId(item.id, prev))
		}
		setTrash([])
		setDeletedProjects([])
		setDeletedSprints([])
		setEmptyConfirm(false)
	}

	const restoreProject = (id: string) => {
		const project = deletedProjects.find((p) => p.id === id)
		if (!project) return
		const { deletedAt: _deletedAt, ...restoredProject } = project
		setDeletedProjects((prev) => prev.filter((p) => p.id !== id))
		setProjects((prev) => [...prev, restoredProject])
	}

	const deleteProjectPermanently = (id: string) => {
		setDeletedSprints((prev) => prev.filter((s) => s.projectId !== id))
		setDeletedProjects((prev) => prev.filter((p) => p.id !== id))
		setDeleteProjectId(null)
	}

	const restoreSprint = (id: string) => {
		const sprint = deletedSprints.find((s) => s.id === id)
		if (!sprint) return
		const { deletedAt: _deletedAt, ...restoredSprint } = sprint
		setDeletedSprints((prev) => prev.filter((s) => s.id !== id))
		setSprints((prev) => [...prev, restoredSprint])
	}

	const deleteSprintPermanently = (id: string) => {
		setDeletedSprints((prev) => prev.filter((s) => s.id !== id))
		setDeleteSprintId(null)
	}

	const hasItems =
		trash.length > 0 || deletedProjects.length > 0 || deletedSprints.length > 0

	return (
		<div className="mt-4 space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-gray-800 text-xl dark:text-gray-100">
					{dict.trash.title}
				</h2>
				{hasItems && (
					<Button
						size="sm"
						variant="ghost"
						onPress={() => setEmptyConfirm(true)}
					>
						<HiMiniTrash className="h-4 w-4" />
						{dict.trash.empty_trash}
					</Button>
				)}
			</div>

			{/* Tasks */}
			{trash.length === 0 &&
			deletedProjects.length === 0 &&
			deletedSprints.length === 0 ? (
				<p className="select-none py-8 text-center text-gray-400 italic">
					{dict.trash.no_items}
				</p>
			) : (
				<div className="space-y-6">
					{/* Deleted tasks */}
					{trash.length > 0 && (
						<div className="flex flex-col gap-3">
							<h3 className="font-semibold text-gray-600 text-sm dark:text-gray-400">
								{dict.trash.deleted_tasks} ({trash.length})
							</h3>
							{trash.map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-gray-700 line-through dark:text-gray-300">
											{item.title}
										</p>
										{item.deletedAt && (
											<Chip color="danger" size="sm">
												{dict.trash.deleted_at}:{' '}
												{moment(item.deletedAt).format(DATE_FORMAT)}
											</Chip>
										)}
									</div>
									<div className="flex shrink-0 gap-2">
										<Button
											size="sm"
											variant="secondary"
											onPress={() => restoreTodo(item.id)}
										>
											<HiArrowUturnLeft className="h-4 w-4" />
											{dict.trash.restore}
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onPress={() => setDeleteId(item.id)}
										>
											<HiMiniTrash className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Deleted projects */}
					{deletedProjects.length > 0 && (
						<div className="flex flex-col gap-3">
							<h3 className="font-semibold text-gray-600 text-sm dark:text-gray-400">
								{dict.trash.deleted_projects} ({deletedProjects.length})
							</h3>
							{deletedProjects.map((project) => (
								<div
									key={project.id}
									className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span
												className="h-3 w-3 shrink-0 rounded-full"
												style={{ backgroundColor: project.color }}
											/>
											<p className="truncate font-medium text-gray-700 line-through dark:text-gray-300">
												{project.name}
											</p>
										</div>
										<Chip color="danger" size="sm">
											{dict.trash.deleted_at}:{' '}
											{moment(project.deletedAt).format(DATE_FORMAT)}
										</Chip>
									</div>
									<div className="flex shrink-0 gap-2">
										<Button
											size="sm"
											variant="secondary"
											onPress={() => restoreProject(project.id)}
										>
											<HiArrowUturnLeft className="h-4 w-4" />
											{dict.trash.restore}
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onPress={() => setDeleteProjectId(project.id)}
										>
											<HiMiniTrash className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Deleted sprints */}
					{deletedSprints.length > 0 && (
						<div className="flex flex-col gap-3">
							<h3 className="font-semibold text-gray-600 text-sm dark:text-gray-400">
								{dict.trash.deleted_sprints} ({deletedSprints.length})
							</h3>
							{deletedSprints.map((sprint) => (
								<div
									key={sprint.id}
									className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span
												className="h-3 w-3 shrink-0 rounded-full"
												style={{ backgroundColor: sprint.color }}
											/>
											<p className="truncate font-medium text-gray-700 line-through dark:text-gray-300">
												{sprint.name}
											</p>
										</div>
										<Chip color="danger" size="sm">
											{dict.trash.deleted_at}:{' '}
											{moment(sprint.deletedAt).format(DATE_FORMAT)}
										</Chip>
									</div>
									<div className="flex shrink-0 gap-2">
										<Button
											size="sm"
											variant="secondary"
											onPress={() => restoreSprint(sprint.id)}
										>
											<HiArrowUturnLeft className="h-4 w-4" />
											{dict.trash.restore}
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onPress={() => setDeleteSprintId(sprint.id)}
										>
											<HiMiniTrash className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			<ConfirmModal
				buttonCancel={dict.trash.cancel}
				buttonConfirm={dict.trash.delete_permanently}
				description={dict.trash.delete_confirm}
				isOpen={deleteId !== null}
				title={dict.trash.delete_permanently}
				onCancel={() => setDeleteId(null)}
				onConfirm={() => deleteId && deletePermanently(deleteId)}
			/>

			<ConfirmModal
				buttonCancel={dict.trash.cancel}
				buttonConfirm={dict.trash.delete_permanently}
				description={dict.trash.delete_project_confirm}
				isOpen={deleteProjectId !== null}
				title={dict.trash.delete_permanently}
				onCancel={() => setDeleteProjectId(null)}
				onConfirm={() =>
					deleteProjectId && deleteProjectPermanently(deleteProjectId)
				}
			/>

			<ConfirmModal
				buttonCancel={dict.trash.cancel}
				buttonConfirm={dict.trash.delete_permanently}
				description={dict.trash.delete_sprint_confirm}
				isOpen={deleteSprintId !== null}
				title={dict.trash.delete_permanently}
				onCancel={() => setDeleteSprintId(null)}
				onConfirm={() =>
					deleteSprintId && deleteSprintPermanently(deleteSprintId)
				}
			/>

			<ConfirmModal
				buttonCancel={dict.trash.cancel}
				buttonConfirm={dict.trash.empty_trash}
				description={dict.trash.empty_trash_confirm}
				isOpen={emptyConfirm}
				title={dict.trash.empty_trash}
				onCancel={() => setEmptyConfirm(false)}
				onConfirm={emptyTrash}
			/>
		</div>
	)
}

export default TrashView
