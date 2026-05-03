import React from 'react'
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
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  )
}

function ModalContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-4 flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
      {children}
    </div>
  )
}

function ModalHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b px-6 py-4 text-lg font-semibold">{children}</div>
  )
}

function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 px-6 py-4">{children}</div>
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 border-t px-6 py-4">{children}</div>
  )
}

export { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader }
