import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { HiMiniTrash } from 'react-icons/hi2'

import { commentsAtom, dictAtom } from '@/atoms'
import { Button } from '@/components/UI'
import type { Comment } from '@/types'
import {
	addCommentStorage,
	DATE_FORMAT,
	getCommentsStorage,
	removeCommentStorage,
} from '@/utils'

interface CommentsProps {
	todoId: string
}

function Comments({ todoId }: CommentsProps) {
	const [comments, setComments] = useAtom(commentsAtom)
	const dict = useAtomValue(dictAtom)
	const [text, setText] = React.useState('')
	const bottomRef = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		setComments(getCommentsStorage())
	}, [setComments])

	const todoComments = comments.filter((c) => c.todoId === todoId)

	React.useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [])

	const handleSend = () => {
		const trimmed = text.trim()
		if (!trimmed) return
		const newComment: Comment = {
			id: crypto.randomUUID(),
			todoId,
			text: trimmed,
			createdAt: new Date().toISOString(),
		}
		setComments(addCommentStorage(newComment, comments))
		setText('')
	}

	return (
		<div className="mt-3 border-gray-200 border-t pt-3 dark:border-gray-600">
			<p className="mb-2 font-semibold text-gray-400 text-xs uppercase tracking-wide dark:text-gray-500">
				{dict.todolist.comments.title}
			</p>

			{/* Bubbles */}
			<div className="mb-3 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
				{todoComments.length === 0 ? (
					<p className="py-2 text-center text-gray-400 text-sm italic dark:text-gray-500">
						{dict.todolist.comments.no_comments}
					</p>
				) : (
					todoComments.map((comment) => (
						<div
							key={comment.id}
							className="group flex items-end justify-end gap-2"
						>
							<button
								className="mb-5 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:text-gray-500 dark:hover:text-red-400"
								type="button"
								onClick={() =>
									setComments(removeCommentStorage(comment.id, comments))
								}
							>
								<HiMiniTrash className="h-3.5 w-3.5" />
							</button>
							<div className="max-w-[75%] rounded-2xl rounded-br-sm bg-blue-500 px-4 py-2 text-white shadow-sm dark:bg-blue-600">
								<p className="whitespace-pre-wrap text-sm">{comment.text}</p>
								<span className="mt-1 block text-right text-[10px] text-blue-100">
									{moment(comment.createdAt).format(DATE_FORMAT)}
								</span>
							</div>
						</div>
					))
				)}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<div className="flex items-end gap-2">
				<textarea
					className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
					placeholder={
						typeof window !== 'undefined' && window.innerWidth < 640
							? dict.todolist.comments.placeholder
							: dict.todolist.comments.placeholder_full
					}
					rows={2}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							handleSend()
						}
					}}
				/>
				<Button size="sm" variant="primary" onPress={handleSend}>
					{dict.todolist.comments.send}
				</Button>
			</div>
		</div>
	)
}

export default Comments
