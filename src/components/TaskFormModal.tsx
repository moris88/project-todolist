import { useAtomValue } from 'jotai'
import React from 'react'

import { dictAtom } from '@/atoms'
import { MarkdownContent } from '@/components'
import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@/components/UI'
import { Category, Priority } from '@/types'
import { priorityItems } from '@/utils'

export interface TaskFormValues {
  title: string
  description: string
  priority: Priority
  dueDate: string | null
  category: Category
}

interface TaskFormBodyProps {
  initialValues: Partial<TaskFormValues>
  showCategory: boolean
  headerLabel: string
  submitLabel: string
  cancelLabel: string
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void
}

function TaskFormBody({
  initialValues,
  showCategory,
  headerLabel,
  submitLabel,
  cancelLabel,
  onClose,
  onSubmit,
}: TaskFormBodyProps) {
  const dict = useAtomValue(dictAtom)
  const [title, setTitle] = React.useState(initialValues.title ?? '')
  const [description, setDescription] = React.useState(
    initialValues.description ?? ''
  )
  const [priority, setPriority] = React.useState<Priority>(
    initialValues.priority ?? 'medium'
  )
  const [dueDate, setDueDate] = React.useState<string | null>(
    initialValues.dueDate ?? null
  )
  const [category, setCategory] = React.useState<Category>(
    initialValues.category ?? 'todo'
  )
  const [markdownPreview, setMarkdownPreview] = React.useState(false)

  const minValue = new Date().toISOString().slice(0, 16)

  const handlePriorityChange = (value: string) => {
    const map: Record<string, Priority> = {
      '0': 'urgent',
      '1': 'high',
      '2': 'medium',
      '3': 'low',
    }
    setPriority(map[value])
  }

  return (
    <>
      <ModalHeader>{headerLabel}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <Input
            isRequired
            className="w-full"
            label={dict.todolist.addTask.name}
            placeholder={dict.todolist.addTask.placeholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <DatePicker
            showMonthAndYearPickers
            className="w-full"
            granularity="minute"
            label={dict.todolist.addTask.due_date}
            minValue={minValue}
            value={dueDate}
            onChange={(iso) => setDueDate(iso)}
          />
          <Select
            defaultSelectedKeys={priorityItems.indexOf(priority).toString()}
            label={dict.todolist.listitem.priority.label}
            onChange={(e) => handlePriorityChange(e.target.value)}
          >
            {priorityItems.map((item, index) => (
              <SelectItem key={index} value={String(index)}>
                {
                  dict.todolist.listitem.priority.items[
                    item as keyof typeof dict.todolist.listitem.priority.items
                  ]
                }
              </SelectItem>
            ))}
          </Select>
          {showCategory && (
            <Select
              className="w-full"
              defaultSelectedKeys={category}
              label={dict.todolist.listitem.category.label}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <SelectItem value="todo">
                {dict.todolist.listitem.category.items.todo}
              </SelectItem>
              <SelectItem value="inProgress">
                {dict.todolist.listitem.category.items.inProgress}
              </SelectItem>
              <SelectItem value="done">
                {dict.todolist.listitem.category.items.done}
              </SelectItem>
            </Select>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                className={`rounded-t px-3 py-1 text-sm font-medium transition-colors ${!markdownPreview ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                type="button"
                onClick={() => setMarkdownPreview(false)}
              >
                {dict.todolist.editTask.edit}
              </button>
              <button
                className={`rounded-t px-3 py-1 text-sm font-medium transition-colors ${markdownPreview ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                type="button"
                onClick={() => setMarkdownPreview(true)}
              >
                {dict.todolist.editTask.preview}
              </button>
            </div>
            {markdownPreview ? (
              <div className="min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                {description ? (
                  <MarkdownContent content={description} />
                ) : (
                  <span className="text-sm italic text-gray-400">
                    {dict.todolist.editTask.emptyPreview}
                  </span>
                )}
              </div>
            ) : (
              <Textarea
                className="w-full"
                label={dict.todolist.addTask.label}
                maxRows={10}
                minRows={5}
                size="lg"
                value={description}
                onChange={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setDescription(e.target.value)
                }}
              />
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" variant="ghost" onPress={onClose}>
          {cancelLabel}
        </Button>
        <Button
          size="lg"
          variant="primary"
          onPress={() => onSubmit({ title, description, priority, dueDate, category })}
        >
          {submitLabel}
        </Button>
      </ModalFooter>
    </>
  )
}

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void
  headerLabel: string
  submitLabel: string
  cancelLabel: string
  initialValues?: Partial<TaskFormValues>
  showCategory?: boolean
  isDismissable?: boolean
}

function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  headerLabel,
  submitLabel,
  cancelLabel,
  initialValues = {},
  showCategory = false,
  isDismissable = true,
}: TaskFormModalProps) {
  if (!isOpen) return null

  return (
    <Modal isDismissable={isDismissable} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <TaskFormBody
          cancelLabel={cancelLabel}
          headerLabel={headerLabel}
          initialValues={initialValues}
          showCategory={showCategory}
          submitLabel={submitLabel}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </ModalContent>
    </Modal>
  )
}

export default TaskFormModal
