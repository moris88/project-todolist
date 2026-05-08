import type { Comment } from '@/types'

function saveComments(comments: Comment[]): Comment[] {
	localStorage.setItem('comments', JSON.stringify(comments))
	return comments
}

export function getCommentsStorage(): Comment[] {
	const raw = localStorage.getItem('comments')
	if (!raw) return []
	try {
		return JSON.parse(raw) as Comment[]
	} catch {
		return []
	}
}

export function addCommentStorage(
	comment: Comment,
	comments: Comment[],
): Comment[] {
	return saveComments([...comments, comment])
}

export function removeCommentStorage(
	commentId: string,
	comments: Comment[],
): Comment[] {
	return saveComments(comments.filter((c) => c.id !== commentId))
}

export function removeCommentsByTodoId(
	todoId: string,
	comments: Comment[],
): Comment[] {
	return saveComments(comments.filter((c) => c.todoId !== todoId))
}

export function mergeCommentsStorage(
	incoming: Comment[],
	existing: Comment[],
): Comment[] {
	const existingIds = new Set(existing.map((c) => c.id))
	const toAdd = incoming.filter((c) => !existingIds.has(c.id))
	return saveComments([...existing, ...toAdd])
}
