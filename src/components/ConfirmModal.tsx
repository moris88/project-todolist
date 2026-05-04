import MarkdownContent from '@/components/MarkdownContent'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/UI'
import type { ButtonVariant } from '@/components/UI/Button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  isMarkdown?: boolean
  buttonConfirm?: string
  buttonCancel?: string
  onConfirm?: () => void
  onCancel?: () => void
  variantConfirm?: ButtonVariant
  variantCancel?: ButtonVariant
}

function ConfirmModal({
  isOpen,
  title,
  description,
  isMarkdown = false,
  buttonConfirm,
  buttonCancel,
  variantConfirm = 'primary',
  variantCancel = 'ghost',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal isDismissable={true} isOpen={isOpen} onClose={onCancel}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          {isMarkdown ? (
            <MarkdownContent content={description} />
          ) : (
            <p>{description}</p>
          )}
        </ModalBody>
        <ModalFooter>
          {buttonCancel && onCancel && (
            <Button variant={variantCancel} onPress={onCancel}>
              {buttonCancel}
            </Button>
          )}
          {onConfirm && (
            <Button variant={variantConfirm} onPress={onConfirm}>
              {buttonConfirm ?? 'Confirm'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmModal
