import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { HiFlag, HiMiniPlus } from 'react-icons/hi2'
import {
  LuBold,
  LuCheck,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuItalic,
  LuList,
  LuListOrdered,
  LuPencil,
  LuUndo2,
  LuX,
} from 'react-icons/lu'

import { dictAtom, tagsAtom } from '@/atoms'
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
import { Priority, Status, SubTask, Todo } from '@/types'
import { generateUniqueId, priorityItems, tagColor } from '@/utils'

export interface TaskFormValues {
  title: string
  description: string
  priority: Priority
  dueDate: string | null
  status: Status
  subtasks: SubTask[]
  tags: string[]
}

export interface SubtaskTransfer {
  subtask: SubTask
  targetTaskId: string
}

interface TaskFormBodyProps {
  initialValues: Partial<TaskFormValues>
  headerLabel: string
  submitLabel: string
  cancelLabel: string
  allTasks?: Todo[]
  currentTaskId?: string
  onClose: () => void
  onSubmit: (values: TaskFormValues, transfers: SubtaskTransfer[]) => void
}

function TaskFormBody({
  initialValues,
  headerLabel,
  submitLabel,
  cancelLabel,
  allTasks,
  currentTaskId,
  onClose,
  onSubmit,
}: TaskFormBodyProps) {
  const dict = useAtomValue(dictAtom)
  const [globalTags, setGlobalTags] = useAtom(tagsAtom)
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [formatHistory, setFormatHistory] = React.useState<string[]>([])
  const [editingSubtaskId, setEditingSubtaskId] = React.useState<string | null>(
    null
  )
  const [editingSubtaskTitle, setEditingSubtaskTitle] = React.useState('')
  const [editingSubtaskTargetId, setEditingSubtaskTargetId] =
    React.useState<string>('')
  const [subtaskTransfers, setSubtaskTransfers] = React.useState<
    SubtaskTransfer[]
  >([])
  const [tags, setTags] = React.useState<string[]>(initialValues.tags ?? [])
  const [newTagInput, setNewTagInput] = React.useState('')

  const minValue = new Date().toISOString().slice(0, 16)

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    if (!globalTags.includes(trimmed)) {
      setGlobalTags((prev) => [...prev, trimmed])
    }
    setNewTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const applyFormat = (
    format: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol'
  ) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = description.slice(start, end)
    const before = description.slice(0, start)
    const after = description.slice(end)

    let newValue: string
    let newStart: number
    let newEnd: number

    if (format === 'bold') {
      const text = selected || 'testo in grassetto'
      newValue = before + `**${text}**` + after
      newStart = start + 2
      newEnd = start + 2 + text.length
    } else if (format === 'italic') {
      const text = selected || 'testo in corsivo'
      newValue = before + `*${text}*` + after
      newStart = start + 1
      newEnd = start + 1 + text.length
    } else {
      const lineStart = before.lastIndexOf('\n') + 1
      const linesBefore = description.slice(0, lineStart)
      const fromLineStart = description.slice(lineStart)
      const newlineIdx = fromLineStart.indexOf('\n')
      const lineEnd =
        newlineIdx === -1 ? description.length : lineStart + newlineIdx
      const currentLine = description.slice(lineStart, lineEnd)
      const linesAfter = description.slice(lineEnd)
      const cleanLine = currentLine.replace(/^(#{1,3} |- |\d+\. )/, '')
      const prefix =
        format === 'h1'
          ? '# '
          : format === 'h2'
            ? '## '
            : format === 'h3'
              ? '### '
              : format === 'ul'
                ? '- '
                : '1. '
      const newLine = prefix + cleanLine
      newValue = linesBefore + newLine + linesAfter
      newStart = lineStart + newLine.length
      newEnd = newStart
    }

    setFormatHistory((prev) => [...prev, description])
    setDescription(newValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newStart, newEnd)
    })
  }

  const undoFormat = () => {
    if (formatHistory.length === 0) return
    const previous = formatHistory[formatHistory.length - 1]
    setFormatHistory((prev) => prev.slice(0, -1))
    setDescription(previous)
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    setSubtasks((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        title: newSubtaskTitle.trim(),
        completed: false,
        completedAt: null,
      },
    ])
    setNewSubtaskTitle('')
  }

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              completed: !s.completed,
              completedAt: !s.completed ? new Date().toISOString() : null,
            }
          : s
      )
    )
  }

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  const startEditSubtask = (id: string, currentTitle: string) => {
    setEditingSubtaskId(id)
    setEditingSubtaskTitle(currentTitle)
    setEditingSubtaskTargetId(currentTaskId ?? '')
  }

  const saveEditSubtask = () => {
    if (!editingSubtaskId) return
    const trimmed = editingSubtaskTitle.trim()
    if (!trimmed) {
      cancelEditSubtask()
      return
    }
    const subtask = subtasks.find((s) => s.id === editingSubtaskId)
    if (!subtask) return
    if (editingSubtaskTargetId && editingSubtaskTargetId !== currentTaskId) {
      setSubtasks((prev) => prev.filter((s) => s.id !== editingSubtaskId))
      setSubtaskTransfers((prev) => [
        ...prev,
        {
          subtask: { ...subtask, title: trimmed },
          targetTaskId: editingSubtaskTargetId,
        },
      ])
    } else {
      setSubtasks((prev) =>
        prev.map((s) =>
          s.id === editingSubtaskId ? { ...s, title: trimmed } : s
        )
      )
    }
    setEditingSubtaskId(null)
    setEditingSubtaskTitle('')
    setEditingSubtaskTargetId('')
  }

  const cancelEditSubtask = () => {
    setEditingSubtaskId(null)
    setEditingSubtaskTitle('')
    setEditingSubtaskTargetId('')
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
              <SelectItem
                key={index}
                startContent={
                  item === 'urgent' ? (
                    <HiFlag className="h-3.5 w-3.5 text-red-600" />
                  ) : item === 'high' ? (
                    <HiFlag className="h-3.5 w-3.5 text-yellow-500" />
                  ) : item === 'low' ? (
                    <HiFlag className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <HiFlag className="h-3.5 w-3.5 text-gray-400" />
                  )
                }
                value={String(index)}
              >
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
          {/* Tags section */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {dict.todolist.tags.title}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tagColor(tag)}`}
                  >
                    {tag}
                    <button
                      className="ml-0.5 opacity-70 hover:opacity-100"
                      title="Rimuovi"
                      type="button"
                      onClick={() => removeTag(tag)}
                    >
                      <LuX size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {globalTags.filter((t) => !tags.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="self-center text-xs text-gray-400">
                  {dict.todolist.tags.suggestions}:
                </span>
                {globalTags
                  .filter((t) => !tags.includes(t))
                  .map((tag) => (
                    <button
                      key={tag}
                      className={`inline-flex items-center gap-0.5 rounded-full border border-current px-2 py-0.5 text-xs font-medium opacity-60 transition-opacity hover:opacity-100 ${tagColor(tag)}`}
                      title="Aggiungi al task"
                      type="button"
                      onClick={() => addTag(tag)}
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder={dict.todolist.tags.placeholder}
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(newTagInput)
                  }
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                onPress={() => addTag(newTagInput)}
              >
                <HiMiniPlus className="h-4 w-4" />
                {dict.todolist.tags.add}
              </Button>
            </div>
          </div>
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
            {!markdownPreview && (
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 dark:border-gray-700 dark:bg-gray-800/50">
                {(
                  [
                    { format: 'bold', icon: LuBold, title: 'Grassetto' },
                    { format: 'italic', icon: LuItalic, title: 'Corsivo' },
                    { format: 'h1', icon: LuHeading1, title: 'Titolo H1' },
                    { format: 'h2', icon: LuHeading2, title: 'Titolo H2' },
                    { format: 'h3', icon: LuHeading3, title: 'Titolo H3' },
                    { format: 'ul', icon: LuList, title: 'Lista puntata' },
                    {
                      format: 'ol',
                      icon: LuListOrdered,
                      title: 'Lista numerata',
                    },
                  ] as const
                ).map(({ format, icon: Icon, title }) => (
                  <button
                    key={format}
                    className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                    title={title}
                    type="button"
                    onClick={() => applyFormat(format)}
                  >
                    <Icon size={16} />
                  </button>
                ))}
                <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />
                <button
                  className="rounded p-1.5 transition-colors enabled:text-gray-600 enabled:hover:bg-gray-200 enabled:hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:enabled:text-gray-400 dark:enabled:hover:bg-gray-700 dark:enabled:hover:text-gray-100"
                  disabled={formatHistory.length === 0}
                  title="Annulla ultima operazione"
                  type="button"
                  onClick={undoFormat}
                >
                  <LuUndo2 size={16} />
                </button>
              </div>
            )}
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
                ref={textareaRef}
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
                      className="h-4 w-4 shrink-0 cursor-pointer accent-blue-500"
                      type="checkbox"
                      onChange={() => toggleSubtask(s.id)}
                    />
                    {editingSubtaskId === s.id ? (
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            className="flex-1 rounded border border-blue-400 bg-white px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            type="text"
                            value={editingSubtaskTitle}
                            onChange={(e) =>
                              setEditingSubtaskTitle(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                saveEditSubtask()
                              } else if (e.key === 'Escape') {
                                cancelEditSubtask()
                              }
                            }}
                          />
                          {allTasks && allTasks.length > 1 && (
                            <select
                              className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                              title="Task padre"
                              value={editingSubtaskTargetId}
                              onChange={(e) =>
                                setEditingSubtaskTargetId(e.target.value)
                              }
                            >
                              {allTasks
                                .filter(
                                  (t) => !t.completed || t.id === currentTaskId
                                )
                                .map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.title}
                                    {t.id === currentTaskId
                                      ? ' (corrente)'
                                      : ''}
                                  </option>
                                ))}
                            </select>
                          )}
                          <button
                            className="text-green-500 transition-colors hover:text-green-700"
                            title="Salva"
                            type="button"
                            onClick={saveEditSubtask}
                          >
                            <LuCheck size={15} />
                          </button>
                          <button
                            className="text-gray-400 transition-colors hover:text-gray-600"
                            title="Annulla"
                            type="button"
                            onClick={cancelEditSubtask}
                          >
                            <LuX size={15} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1">
                          <span
                            className={`block text-sm ${s.completed ? 'text-gray-400 line-through' : ''}`}
                          >
                            {s.title}
                          </span>
                          {s.completed && s.completedAt && (
                            <span className="block text-xs text-gray-400 dark:text-gray-500">
                              {moment(s.completedAt).format('DD/MM/YYYY HH:mm')}
                            </span>
                          )}
                        </span>
                        <button
                          className="text-gray-400 transition-colors hover:text-blue-500"
                          title="Modifica"
                          type="button"
                          onClick={() => startEditSubtask(s.id, s.title)}
                        >
                          <LuPencil size={13} />
                        </button>
                        <button
                          className="text-gray-400 transition-colors hover:text-red-500"
                          title="Elimina"
                          type="button"
                          onClick={() => removeSubtask(s.id)}
                        >
                          <LuX size={15} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2 md:flex-row">
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
                <HiMiniPlus className="h-4 w-4" />
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
            onSubmit(
              { title, description, priority, dueDate, status, subtasks, tags },
              subtaskTransfers
            )
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
  onSubmit: (values: TaskFormValues, transfers: SubtaskTransfer[]) => void
  headerLabel: string
  submitLabel: string
  cancelLabel: string
  initialValues?: Partial<TaskFormValues>
  isDismissable?: boolean
  allTasks?: Todo[]
  currentTaskId?: string
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
  allTasks,
  currentTaskId,
}: TaskFormModalProps) {
  if (!isOpen) return null

  return (
    <Modal isDismissable={isDismissable} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <TaskFormBody
          allTasks={allTasks}
          cancelLabel={cancelLabel}
          currentTaskId={currentTaskId}
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
