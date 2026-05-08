import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { GoAlertFill } from 'react-icons/go'
import { HiFlag, HiOutlinePencilSquare, HiXMark } from 'react-icons/hi2'

import { dictAtom, todoListAtom } from '@/atoms'
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/UI'
import { Status } from '@/types'
import { Todo } from '@/types'
import { isTaskOverdue, tagColor, updateTodoStorage } from '@/utils'

import Comments from './Comments'
import ConfirmModal from './ConfirmModal'
import MarkdownContent from './MarkdownContent'
import TaskFormModal from './TaskFormModal'
import { SubtaskTransfer, TaskFormValues } from './TaskFormModal'

interface TaskDetailModalProps {
  todoId: string | null
  isOpen: boolean
  onClose: () => void
}

const priorityChipColor: Record<
  string,
  'default' | 'success' | 'warning' | 'danger'
> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'success',
}

function TaskDetailModal({ todoId, isOpen, onClose }: TaskDetailModalProps) {
  const dict = useAtomValue(dictAtom)
  const [todos, setTodos] = useAtom(todoListAtom)

  const [isEditing, setIsEditing] = React.useState(false)
  const [pendingEditValues, setPendingEditValues] =
    React.useState<TaskFormValues | null>(null)
  const [pendingTransfers, setPendingTransfers] = React.useState<
    SubtaskTransfer[]
  >([])
  const [showEditConfirm, setShowEditConfirm] = React.useState(false)
  const [isEditingStatus, setIsEditingStatus] = React.useState(false)
  const statusDropdownRef = React.useRef<HTMLDivElement>(null)

  const todo: Todo | null = todos.find((t) => t.id === todoId) ?? null

  React.useEffect(() => {
    if (!isEditingStatus) return
    const handler = (e: MouseEvent) => {
      if (!statusDropdownRef.current?.contains(e.target as Node)) {
        setIsEditingStatus(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isEditingStatus])

  if (!todo) return null

  const overdue = isTaskOverdue(todo.dueDate)
  const completedSubtasks =
    todo.subtasks?.filter((s) => s.completed).length ?? 0

  const toggleSubtask = (subtaskId: string) => {
    setTodos(
      updateTodoStorage(
        todos.map((t) => {
          if (t.id !== todo.id) return t
          return {
            ...t,
            subtasks: t.subtasks.map((s) =>
              s.id === subtaskId
                ? {
                    ...s,
                    completed: !s.completed,
                    completedAt: !s.completed ? new Date().toISOString() : null,
                  }
                : s
            ),
            updatedAt: new Date().toISOString(),
          }
        })
      )
    )
  }

  const allStatuses: Status[] = [
    'todo',
    'progress',
    'review',
    'testing',
    'blocked',
    'paused',
    'done',
    'archived',
  ]

  const statusColor = (s: Status) =>
    s === 'done'
      ? 'bg-green-500'
      : s === 'todo'
        ? 'bg-gray-400'
        : s === 'archived'
          ? 'bg-red-500'
          : 'bg-yellow-500'

  const updateStatusInline = (newStatus: Status) => {
    setTodos(
      updateTodoStorage(
        todos.map((t) => {
          if (t.id !== todo.id) return t
          return {
            ...t,
            status: newStatus,
            completed: newStatus === 'done',
            completedAt:
              newStatus === 'done' && !t.completed
                ? new Date().toISOString()
                : t.completedAt,
            updatedAt: new Date().toISOString(),
          }
        })
      )
    )
    setIsEditingStatus(false)
  }

  const handleEditSubmit = (
    values: TaskFormValues,
    transfers: SubtaskTransfer[]
  ) => {
    setPendingEditValues(values)
    setPendingTransfers(transfers)
    setShowEditConfirm(true)
  }

  const confirmUpdate = () => {
    if (!pendingEditValues) return
    let updated = todos.map((t) => {
      if (t.id !== todo.id) return t
      return {
        ...t,
        title: pendingEditValues.title,
        description: pendingEditValues.description,
        priority: pendingEditValues.priority as Todo['priority'],
        dueDate: pendingEditValues.dueDate,
        status: pendingEditValues.status,
        subtasks: pendingEditValues.subtasks,
        tags: pendingEditValues.tags,
        completed: pendingEditValues.status === 'done' ? true : t.completed,
        completedAt:
          pendingEditValues.status === 'done' && !t.completed
            ? new Date().toISOString()
            : t.completedAt,
        updatedAt: new Date().toISOString(),
      }
    })
    for (const transfer of pendingTransfers) {
      updated = updated.map((t) => {
        if (t.id !== transfer.targetTaskId) return t
        return {
          ...t,
          subtasks: [...t.subtasks, transfer.subtask],
          updatedAt: new Date().toISOString(),
        }
      })
    }
    setTodos(updateTodoStorage(updated))
    setPendingEditValues(null)
    setPendingTransfers([])
    setIsEditing(false)
    setShowEditConfirm(false)
  }

  const flagIcon: Record<string, React.ReactNode> = {
    low: <HiFlag className="h-4 w-4 shrink-0 text-green-600" />,
    medium: null,
    high: <HiFlag className="h-4 w-4 shrink-0 text-yellow-600" />,
    urgent: <HiFlag className="h-4 w-4 shrink-0 text-red-600" />,
  }

  return (
    <>
      <Modal isDismissable isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {overdue && !todo.completed && (
                  <GoAlertFill className="h-4 w-4 shrink-0 text-red-600" />
                )}
                {flagIcon[todo.priority]}
                <span
                  className={`truncate ${todo.completed ? 'text-green-600 line-through' : ''}`}
                >
                  {todo.title}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  isDisabled={todo.completed || todo.status === 'archived'}
                  size="sm"
                  variant="ghost"
                  onPress={() => setIsEditing(true)}
                >
                  <HiOutlinePencilSquare className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">
                    {dict.todolist.listitem.edit}
                  </span>
                </Button>
                <button
                  className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                  type="button"
                  onClick={onClose}
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="flex flex-col gap-5">
              {/* Status · Priority · Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <div ref={statusDropdownRef} className="relative">
                  <div className="flex items-center gap-1">
                    <Chip
                      color={
                        todo.status === 'done'
                          ? 'success'
                          : todo.status === 'todo'
                            ? 'default'
                            : todo.status === 'archived'
                              ? 'danger'
                              : 'warning'
                      }
                    >
                      {dict.todolist.listitem.status.status}:{' '}
                      {dict.todolist.listitem.status.items[todo.status]}
                    </Chip>
                    <button
                      className="rounded p-0.5 text-gray-400 transition-colors hover:text-blue-500"
                      type="button"
                      onClick={() => setIsEditingStatus((v) => !v)}
                    >
                      <HiOutlinePencilSquare className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {isEditingStatus && (
                    <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                      {allStatuses.map((s) => (
                        <button
                          key={s}
                          className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            todo.status === s
                              ? 'font-semibold text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                          type="button"
                          onClick={() => updateStatusInline(s)}
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${statusColor(s)}`}
                          />
                          {dict.todolist.listitem.status.items[s]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Chip color={priorityChipColor[todo.priority]}>
                  {dict.todolist.listitem.priority.items[todo.priority]}
                </Chip>
                {(todo.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Dates */}
              <div className="flex flex-wrap gap-2">
                {todo.createdAt && (
                  <Chip color="default" size="sm">
                    {dict.todolist.listitem.createdAt}:{' '}
                    {moment(todo.createdAt).format('DD/MM/YYYY HH:mm')}
                  </Chip>
                )}
                {todo.updatedAt && (
                  <Chip color="default" size="sm">
                    {dict.todolist.listitem.updatedAt}:{' '}
                    {moment(todo.updatedAt).format('DD/MM/YYYY HH:mm')}
                  </Chip>
                )}
                {todo.completedAt && (
                  <Chip color="success" size="sm">
                    {dict.todolist.listitem.completedAt}:{' '}
                    {moment(todo.completedAt).format('DD/MM/YYYY HH:mm')}
                  </Chip>
                )}
                {todo.dueDate && (
                  <Chip
                    color={overdue && !todo.completed ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {overdue && !todo.completed
                      ? dict.todolist.listitem.expired
                      : dict.todolist.listitem.dueDateAt}
                    : {moment(todo.dueDate).format('DD/MM/YYYY HH:mm')}
                  </Chip>
                )}
              </div>

              {/* Description */}
              {todo.description && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {dict.todolist.listitem.description}
                  </p>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                    <MarkdownContent content={todo.description} />
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {(todo.subtasks?.length ?? 0) > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {dict.todolist.subtasks.title}
                    </p>
                    <span className="text-xs text-gray-400">
                      {completedSubtasks}/{todo.subtasks.length}{' '}
                      {dict.todolist.subtasks.progress}
                    </span>
                  </div>
                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${(completedSubtasks / todo.subtasks.length) * 100}%`,
                      }}
                    />
                  </div>
                  <ul className="flex flex-col gap-1">
                    {todo.subtasks.map((s) => (
                      <li
                        key={s.id}
                        className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
                        onClick={() => !todo.completed && toggleSubtask(s.id)}
                      >
                        <input
                          readOnly
                          checked={s.completed}
                          className="mt-0.5 shrink-0 cursor-pointer accent-blue-500"
                          disabled={todo.completed}
                          type="checkbox"
                        />
                        <span className="flex-1">
                          <span
                            className={
                              s.completed ? 'text-gray-400 line-through' : ''
                            }
                          >
                            {s.title}
                          </span>
                          {s.completed && s.completedAt && (
                            <span className="ml-1 text-xs text-gray-400">
                              —{' '}
                              {moment(s.completedAt).format('DD/MM/YYYY HH:mm')}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comments */}
              <div>
                <Comments todoId={todo.id} />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button size="sm" variant="ghost" onPress={onClose}>
              {dict.todolist.editTask.cancel}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TaskFormModal
        allTasks={todos}
        cancelLabel={dict.todolist.editTask.cancel}
        currentTaskId={todo.id}
        headerLabel={dict.todolist.editTask.info}
        initialValues={{
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          dueDate: todo.dueDate,
          status: todo.status,
          subtasks: todo.subtasks,
          tags: todo.tags ?? [],
        }}
        isDismissable={false}
        isOpen={isEditing}
        submitLabel={dict.todolist.editTask.submit}
        onClose={() => setIsEditing(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmModal
        buttonCancel={dict.todolist.editTask.cancel}
        buttonConfirm={dict.todolist.editTask.submit}
        description={dict.todolist.editTask.description}
        isOpen={showEditConfirm}
        title={dict.todolist.editTask.title}
        onCancel={() => setShowEditConfirm(false)}
        onConfirm={confirmUpdate}
      />
    </>
  )
}

export default TaskDetailModal
