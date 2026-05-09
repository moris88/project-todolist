import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { HiArrowUturnLeft, HiMiniTrash } from 'react-icons/hi2'

import { commentsAtom, dictAtom, todoListAtom, trashAtom } from '@/atoms'
import { ConfirmModal } from '@/components'
import { Button, Chip } from '@/components/UI'
import { addTodoStorage, DATE_FORMAT, removeCommentsByTodoId } from '@/utils'

function TrashView() {
	const [trash, setTrash] = useAtom(trashAtom)
	const [todos, setTodos] = useAtom(todoListAtom)
	const [comments, setComments] = useAtom(commentsAtom)
	const dict = useAtomValue(dictAtom)
	const [deleteId, setDeleteId] = React.useState<string | null>(null)
	const [emptyConfirm, setEmptyConfirm] = React.useState(false)

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
		setEmptyConfirm(false)
	}

	return (
		<div className="mt-4 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-gray-800 text-xl dark:text-gray-100">
					{dict.trash.title}
				</h2>
				{trash.length > 0 && (
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

			{trash.length === 0 ? (
				<p className="select-none py-8 text-center text-gray-400 italic">
					{dict.trash.no_items}
				</p>
			) : (
				<div className="flex flex-col gap-3">
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
