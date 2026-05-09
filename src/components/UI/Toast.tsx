import { AnimatePresence, motion } from 'framer-motion'
import { useAtom } from 'jotai'
import React from 'react'
import { createPortal } from 'react-dom'
import {
	HiCheckCircle,
	HiExclamationCircle,
	HiExclamationTriangle,
	HiInformationCircle,
	HiXMark,
} from 'react-icons/hi2'

import type { ToastMessage } from '@/atoms'
import { toastsAtom } from '@/atoms'

const TOAST_DURATION = 4000

const TYPE_STYLES: Record<
	ToastMessage['type'],
	{ bar: string; icon: string; bg: string; border: string }
> = {
	success: {
		bar: 'bg-green-500',
		icon: 'text-green-500',
		bg: 'bg-white dark:bg-gray-800',
		border: 'border-green-200 dark:border-green-800',
	},
	error: {
		bar: 'bg-red-500',
		icon: 'text-red-500',
		bg: 'bg-white dark:bg-gray-800',
		border: 'border-red-200 dark:border-red-800',
	},
	warning: {
		bar: 'bg-amber-400',
		icon: 'text-amber-500',
		bg: 'bg-white dark:bg-gray-800',
		border: 'border-amber-200 dark:border-amber-700',
	},
	info: {
		bar: 'bg-blue-500',
		icon: 'text-blue-500',
		bg: 'bg-white dark:bg-gray-800',
		border: 'border-blue-200 dark:border-blue-800',
	},
}

const TYPE_ICONS: Record<ToastMessage['type'], React.ReactNode> = {
	success: <HiCheckCircle className="h-5 w-5" />,
	error: <HiExclamationCircle className="h-5 w-5" />,
	warning: <HiExclamationTriangle className="h-5 w-5" />,
	info: <HiInformationCircle className="h-5 w-5" />,
}

function ToastItem({
	toast,
	onDismiss,
}: {
	toast: ToastMessage
	onDismiss: (id: string) => void
}) {
	const styles = TYPE_STYLES[toast.type]

	React.useEffect(() => {
		const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION)
		return () => clearTimeout(timer)
	}, [toast.id, onDismiss])

	return (
		<motion.div
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 48 }}
			initial={{ opacity: 0, x: 48 }}
			transition={{ duration: 0.2 }}
			className={`relative flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-xl border shadow-lg ${styles.bg} ${styles.border}`}
		>
			<span className={`absolute top-0 left-0 h-full w-1 ${styles.bar}`} />
			<span className={`mt-3 ml-4 shrink-0 ${styles.icon}`}>
				{TYPE_ICONS[toast.type]}
			</span>
			<p className="my-3 flex-1 text-gray-800 text-sm leading-snug dark:text-gray-100">
				{toast.message}
			</p>
			<button
				className="mt-2.5 mr-2 shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
				type="button"
				onClick={() => onDismiss(toast.id)}
			>
				<HiXMark className="h-4 w-4" />
			</button>
		</motion.div>
	)
}

function Toast() {
	const [toasts, setToasts] = useAtom(toastsAtom)

	const dismiss = React.useCallback(
		(id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
		[setToasts],
	)

	return createPortal(
		<div className="pointer-events-none fixed right-4 bottom-4 z-[9999] flex flex-col items-end gap-2">
			<AnimatePresence mode="sync">
				{toasts.map((toast) => (
					<div key={toast.id} className="pointer-events-auto">
						<ToastItem toast={toast} onDismiss={dismiss} />
					</div>
				))}
			</AnimatePresence>
		</div>,
		document.body,
	)
}

export default Toast
