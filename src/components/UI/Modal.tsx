import type React from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
	isOpen: boolean
	onClose?: () => void
	isDismissable?: boolean
	children: React.ReactNode
}

function Modal({
	isOpen,
	onClose,
	isDismissable = true,
	children,
}: ModalProps) {
	if (!isOpen) return null

	const handleOverlayClick = () => {
		if (isDismissable !== false && onClose) onClose()
	}

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={handleOverlayClick}
			onPointerDown={(e) => e.stopPropagation()}
			onKeyDown={() => {}}
			onKeyUp={() => {}}
			tabIndex={-1}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			aria-describedby="modal-description"
			data-testid="modal-overlay"
		>
			<div
				className="w-full px-4"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={() => {}}
				onKeyUp={() => {}}
				tabIndex={-1}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				aria-describedby="modal-description"
				data-testid="modal-overlay"
			>
				{children}
			</div>
		</div>,
		document.body,
	)
}

function ModalContent({ children }: { children: React.ReactNode }) {
	return (
		<div className="mx-auto flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl dark:bg-gray-800">
			{children}
		</div>
	)
}

function ModalHeader({ children }: { children: React.ReactNode }) {
	return (
		<div className="border-b px-6 py-4 font-semibold text-lg dark:border-gray-700 dark:text-white">
			{children}
		</div>
	)
}

function ModalBody({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex-1 overflow-y-auto px-6 py-4 dark:text-gray-200">
			{children}
		</div>
	)
}

function ModalFooter({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex justify-end gap-2 border-t px-6 py-4 dark:border-gray-700">
			{children}
		</div>
	)
}

export { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader }
