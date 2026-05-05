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
import { Priority, Status, SubTask } from '@/types'
import { generateUniqueId, priorityItems } from '@/utils'

export interface TaskFormValues {
  title: string
  description: string
  priority: Priority
  dueDate: string | null
  status: Status
  subtasks: SubTask[]
}

interface TaskFormBodyProps {
  initialValues: Partial<TaskFormValues>
  headerLabel: string
  submitLabel: string
  cancelLabel: string
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void
}

function TaskFormBody({
  initialValues,
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
  const [status, setStatus] = React.useState<Status>(
    initialValues.status ?? 'todo'
  )
  const [subtasks, setSubtasks] = React.useState<SubTask[]>(
    initialValues.subtasks ?? []
  )
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('')
  const [markdownPreview, setMarkdownPreview] = React.useState(false)

  const minValue = new Date().toISOString().slice(0, 16)

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    setSubtasks((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ])
    setNewSubtaskTitle('')
  }

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    )
  }

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

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
          <Select
            className="w-full"
            defaultSelectedKeys={status}
            label={dict.todolist.listitem.status.label}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            <SelectItem value="todo">
              {dict.todolist.listitem.status.items.todo}
            </SelectItem>
            <SelectItem value="progress">
              {dict.todolist.listitem.status.items.progress}
            </SelectItem>
            <SelectItem value="done">
              {dict.todolist.listitem.status.items.done}
            </SelectItem>
            <SelectItem value="blocked">
              {dict.todolist.listitem.status.items.blocked}
            </SelectItem>
            <SelectItem value="paused">
              {dict.todolist.listitem.status.items.paused}
            </SelectItem>
            <SelectItem value="review">
              {dict.todolist.listitem.status.items.review}
            </SelectItem>
            <SelectItem value="testing">
              {dict.todolist.listitem.status.items.testing}
            </SelectItem>
            <SelectItem value="archived">
              {dict.todolist.listitem.status.items.archived}
            </SelectItem>
          </Select>
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
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {dict.todolist.subtasks.title}
            </p>
            {subtasks.length === 0 ? (
              <p className="text-sm italic text-gray-400">
                {dict.todolist.subtasks.empty}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {subtasks.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-700/50"
                  >
                    <input
                      checked={s.completed}
                      className="h-4 w-4 cursor-pointer accent-blue-500"
                      type="checkbox"
                      onChange={() => toggleSubtask(s.id)}
                    />
                    <span
                      className={`flex-1 text-sm ${s.completed ? 'text-gray-400 line-through' : ''}`}
                    >
                      {s.title}
                    </span>
                    <button
                      className="text-gray-400 transition-colors hover:text-red-500"
                      type="button"
                      onClick={() => removeSubtask(s.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder={dict.todolist.subtasks.placeholder}
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSubtask()
                  }
                }}
              />
              <Button size="sm" variant="secondary" onPress={addSubtask}>
                {dict.todolist.subtasks.add}
              </Button>
            </div>
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
          onPress={() =>
            onSubmit({
              title,
              description,
              priority,
              dueDate,
              status,
              subtasks,
            })
          }
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
          submitLabel={submitLabel}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </ModalContent>
    </Modal>
  )
}

export default TaskFormModal
