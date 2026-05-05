import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { BiSolidDetail } from 'react-icons/bi'
import { GoAlertFill } from 'react-icons/go'
import {
  HiArrowRight,
  HiChatBubbleLeftEllipsis,
  HiFlag,
  HiListBullet,
  HiMiniPlus,
  HiMiniTrash,
  HiOutlinePencilSquare,
} from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

import { commentsAtom, dictAtom, todoListAtom } from '@/atoms/atoms'
import {
  ConfirmModal,
  MarkdownContent,
  TaskFormModal,
  TaskFormValues,
} from '@/components'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@/components/UI'
import { Todo } from '@/types'
import {
  generateUniqueId,
  isTaskOverdue,
  removeCommentsByTodoId,
  removeTodoStorage,
  updateTodoStorage,
} from '@/utils'

function Separated() {
  return (
    <span className="hidden md:inline">
      &nbsp;
      {'-'}
      &nbsp;
    </span>
  )
}

interface TodoItemProps {
  todo: Todo
  kanban?: boolean
  showDescriptions?: boolean
  showSubtasks?: boolean
  onCommentPress?: () => void
  isCommentOpen?: boolean
}

function TodoItem({
  todo,
  kanban,
  showDescriptions,
  showSubtasks,
  onCommentPress,
  isCommentOpen,
}: TodoItemProps) {
  const [todos, setTodos] = useAtom(todoListAtom)
  const [comments, setComments] = useAtom(commentsAtom)
  const dict = useAtomValue(dictAtom)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showInlineDetail, setShowInlineDetail] = React.useState(false)
  const [pendingEditValues, setPendingEditValues] =
    React.useState<TaskFormValues | null>(null)
  const [quickAddTitle, setQuickAddTitle] = React.useState('')
  const [showSubtasksLocal, setShowSubtasksLocal] = React.useState(false)
  const [moveSubtaskId, setMoveSubtaskId] = React.useState<string | null>(null)
  const [moveTargetTodoId, setMoveTargetTodoId] = React.useState('')

  const toggleTodo = (
    e?: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const nowCompleting = !todo.completed
    const updatedTodos = todos.map((t) => {
      if (t.id === todo.id) {
        return {
          ...t,
          status: nowCompleting ? 'done' : todo.status,
          completed: nowCompleting,
          completedAt: nowCompleting ? new Date().toISOString() : null,
          subtasks: nowCompleting
            ? t.subtasks.map((s) => ({ ...s, completed: true }))
            : t.subtasks,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })
    setTodos(updateTodoStorage(updatedTodos))
  }

  const removeTodo = () => {
    setShowDeleteModal(true)
  }

  const confirmRemoveTodo = () => {
    setTodos(removeTodoStorage(todos, todo.id))
    setComments(removeCommentsByTodoId(todo.id, comments))
    setShowDeleteModal(false)
  }

  const handleEditSubmit = (values: TaskFormValues) => {
    setPendingEditValues(values)
    setShowEditModal(true)
  }

  const confirmUpdateTodo = () => {
    if (!pendingEditValues) return
    const updatedTodos = todos.map((t) => {
      if (t.id === todo.id) {
        return {
          ...t,
          title: pendingEditValues.title,
          description: pendingEditValues.description,
          priority: pendingEditValues.priority as Todo['priority'],
          dueDate: pendingEditValues.dueDate,
          status: pendingEditValues.status,
          subtasks: pendingEditValues.subtasks,
          completed: pendingEditValues.status === 'done' ? true : t.completed,
          completedAt:
            pendingEditValues.status === 'done' && !t.completed
              ? new Date().toISOString()
              : t.completedAt,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })
    setTodos(updateTodoStorage(updatedTodos))
    setPendingEditValues(null)
    setIsEditing(false)
    setShowEditModal(false)
  }

  const addSubtaskInline = () => {
    if (!quickAddTitle.trim()) return
    const updatedTodos = todos.map((t) => {
      if (t.id !== todo.id) return t
      return {
        ...t,
        subtasks: [
          ...t.subtasks,
          {
            id: generateUniqueId(),
            title: quickAddTitle.trim(),
            completed: false,
          },
        ],
        updatedAt: new Date().toISOString(),
      }
    })
    setTodos(updateTodoStorage(updatedTodos))
    setQuickAddTitle('')
  }

  const toggleSubtaskInList = (subtaskId: string) => {
    const updatedTodos = todos.map((t) => {
      if (t.id !== todo.id) return t
      return {
        ...t,
        subtasks: t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ),
        updatedAt: new Date().toISOString(),
      }
    })
    setTodos(updateTodoStorage(updatedTodos))
  }

  const confirmMoveSubtask = () => {
    if (!moveSubtaskId || !moveTargetTodoId) return
    const subtask = todo.subtasks.find((s) => s.id === moveSubtaskId)
    if (!subtask) return
    const updated = todos.map((t) => {
      if (t.id === todo.id) {
        return {
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== moveSubtaskId),
          updatedAt: new Date().toISOString(),
        }
      }
      if (t.id === moveTargetTodoId) {
        return {
          ...t,
          subtasks: [...t.subtasks, subtask],
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })
    setTodos(updateTodoStorage(updated))
    setMoveSubtaskId(null)
    setMoveTargetTodoId('')
  }

  const flagIcon: Record<string, React.ReactNode> = {
    low: <HiFlag className="h-3 w-3 text-green-600" />,
    medium: <></>,
    high: <HiFlag className="h-3 w-3 text-yellow-600" />,
    urgent: <HiFlag className="h-3 w-3 text-red-600" />,
  }

  const overdue: Record<string, React.ReactNode> = {
    true: <GoAlertFill className="h-4 w-4 text-red-600" />,
    false: <></>,
  }

  return (
    <div
      className={`flex w-full flex-col items-start justify-start gap-y-2 py-2 ${kanban ? '' : 'md:flex-row md:items-center md:justify-between'}`}
    >
      <TaskFormModal
        cancelLabel={dict.todolist.editTask.cancel}
        headerLabel={dict.todolist.editTask.info}
        initialValues={{
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          dueDate: todo.dueDate,
          status: todo.status,
          subtasks: todo.subtasks,
        }}
        isDismissable={false}
        isOpen={isEditing}
        submitLabel={dict.todolist.editTask.submit}
        onClose={() => setIsEditing(false)}
        onSubmit={handleEditSubmit}
      />
      <div className="flex w-full flex-col gap-y-4">
        <div className="flex w-full flex-col items-start gap-y-2">
          <div
            className={`line-clamp-1 flex cursor-pointer items-center gap-2 font-bold ${todo.completed ? 'line-through' : ''}`}
            onClick={toggleTodo}
          >
            <div
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Checkbox
                isSelected={todo.completed}
                onChange={() => toggleTodo()}
              />
            </div>
            {overdue[isTaskOverdue(todo.dueDate) ? 'true' : 'false']}{' '}
            {flagIcon[todo.priority]}{' '}
            <span
              className={`${
                todo.completed
                  ? 'text-green-600'
                  : todo.dueDate && new Date(todo.dueDate) < new Date()
                    ? 'text-red-600'
                    : todo.priority === 'urgent'
                      ? 'text-black dark:text-white'
                      : ''
              } ${kanban ? 'max-w-[70%]' : 'max-w-[80%]'} overflow-hidden text-ellipsis`}
            >
              {todo.title}
            </span>
          </div>
          {(showSubtasks || showSubtasksLocal) && (
            <div
              className="w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {todo.subtasks?.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-3 pb-1 pt-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {dict.todolist.subtasks.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {todo.subtasks.filter((s) => s.completed).length}/
                      {todo.subtasks.length} {dict.todolist.subtasks.progress}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${(todo.subtasks.filter((s) => s.completed).length / todo.subtasks.length) * 100}%`,
                      }}
                    />
                  </div>
                  <ul className="flex flex-col gap-0.5 px-2 py-1">
                    {todo.subtasks.map((s) => (
                      <li
                        key={s.id}
                        className="group flex cursor-pointer items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        onClick={() => toggleSubtaskInList(s.id)}
                      >
                        <input
                          checked={s.completed}
                          className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-blue-500"
                          type="checkbox"
                          onChange={() => toggleSubtaskInList(s.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span
                          className={`flex-1 text-sm leading-snug ${s.completed ? 'text-gray-400 line-through' : ''}`}
                        >
                          {s.title}
                        </span>
                        {todos.filter((t) => t.id !== todo.id).length > 0 && (
                          <button
                            className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-all hover:text-blue-500 group-hover:opacity-100 dark:text-gray-600"
                            title={dict.todolist.subtasks.move}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setMoveSubtaskId(s.id)
                              setMoveTargetTodoId(
                                todos.filter((t) => t.id !== todo.id)[0]?.id ??
                                  ''
                              )
                            }}
                          >
                            <HiArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {(showSubtasks || showSubtasksLocal) && !todo.completed && (
                <div className="flex items-center gap-2 border-t border-gray-200 px-2 py-2 dark:border-gray-700">
                  <input
                    className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder={dict.todolist.subtasks.placeholder}
                    type="text"
                    value={quickAddTitle}
                    onChange={(e) => setQuickAddTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSubtaskInline()
                      }
                    }}
                  />
                  <button
                    className="shrink-0 rounded bg-blue-500 p-1 text-white transition-colors hover:bg-blue-600"
                    type="button"
                    onClick={addSubtaskInline}
                  >
                    <HiMiniPlus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
          {(showDescriptions || showInlineDetail) && todo.description && (
            <div
              className="w-full px-1"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className={isExpanded ? '' : 'line-clamp-3'}>
                <MarkdownContent content={todo.description} />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => setIsExpanded((prev) => !prev)}
              >
                {isExpanded
                  ? dict.todolist.listitem.show_less
                  : dict.todolist.listitem.show_more}
              </Button>
            </div>
          )}
        </div>
        <div
          className={twMerge(
            'flex justify-start gap-y-4 md:justify-between',
            kanban ? 'flex-col' : 'flex-row'
          )}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <small className="flex flex-row flex-wrap items-center">
            {todo.createdAt && (
              <span>
                {dict.todolist.listitem.createdAt}:{' '}
                {moment(todo.createdAt).format('DD/MM/YYYY HH:mm')}
              </span>
            )}
            {todo.updatedAt && (
              <span>
                <Separated />
                {dict.todolist.listitem.updatedAt}:{' '}
                {moment(todo.updatedAt).format('DD/MM/YYYY HH:mm')}
              </span>
            )}
            {todo.completed && (
              <span>
                <Separated />
                <Chip color="success" size="sm">
                  {dict.todolist.listitem.completedAt}:{' '}
                  {moment(todo.completedAt).format('DD/MM/YYYY HH:mm')}
                </Chip>
              </span>
            )}
            {todo.dueDate && !todo.completed && (
              <span>
                <Separated />
                <Chip
                  color={isTaskOverdue(todo.dueDate) ? 'danger' : 'warning'}
                  size="sm"
                >
                  {isTaskOverdue(todo.dueDate)
                    ? dict.todolist.listitem.expired
                    : dict.todolist.listitem.dueDateAt}
                  : {moment(todo.dueDate).format('DD/MM/YYYY HH:mm')}
                </Chip>
              </span>
            )}
          </small>
          <ButtonGroup>
            <Button
              className="md:px-4 md:py-2 md:text-base"
              isDisabled={
                todo.description === '' ||
                todo.description === null ||
                !!showDescriptions
              }
              size="sm"
              variant={showInlineDetail ? 'secondary' : 'primary'}
              onPress={() => setShowInlineDetail((prev) => !prev)}
            >
              <BiSolidDetail className="h-3 w-3 md:h-5 md:w-5" />
            </Button>
            <Button
              className="md:px-4 md:py-2 md:text-base"
              isDisabled={!!showSubtasks}
              size="sm"
              variant={showSubtasksLocal ? 'secondary' : 'primary'}
              onPress={() => setShowSubtasksLocal((prev) => !prev)}
            >
              <HiListBullet className="h-3 w-3 md:h-5 md:w-5" />
            </Button>
            <Button
              className="md:px-4 md:py-2 md:text-base"
              isDisabled={todo.completed}
              size="sm"
              variant="primary"
              onPress={() => setIsEditing(true)}
            >
              <HiOutlinePencilSquare className="h-3 w-3 md:h-5 md:w-5" />
            </Button>
            <Button
              className="md:px-4 md:py-2 md:text-base"
              size="sm"
              variant="primary"
              onPress={removeTodo}
            >
              <HiMiniTrash className="h-3 w-3 md:h-5 md:w-5" />
            </Button>
            {onCommentPress && (
              <Button
                className="md:px-4 md:py-2 md:text-base"
                size="sm"
                variant={isCommentOpen ? 'secondary' : 'primary'}
                onPress={onCommentPress}
              >
                <HiChatBubbleLeftEllipsis className="h-3 w-3 md:h-5 md:w-5" />
              </Button>
            )}
          </ButtonGroup>
        </div>
        {(todo.subtasks?.length > 0 ||
          comments.filter((c) => c.todoId === todo.id).length > 0) && (
          <div className="flex w-full items-center justify-end gap-2">
            {todo.subtasks?.length > 0 && (
              <Chip color="default">
                <HiListBullet className="h-3 w-3 md:h-5 md:w-5" />
                &nbsp;
                {todo.subtasks?.length ?? 0}
              </Chip>
            )}
            {comments.filter((c) => c.todoId === todo.id).length > 0 && (
              <Chip color="default">
                <HiChatBubbleLeftEllipsis className="h-3 w-3 md:h-5 md:w-5" />
                &nbsp;
                {comments.filter((c) => c.todoId === todo.id).length ?? 0}
              </Chip>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        buttonCancel={dict.todolist.deleteTask.cancel}
        buttonConfirm={dict.todolist.deleteTask.delete}
        description={dict.todolist.deleteTask.description}
        isOpen={showDeleteModal}
        title={dict.todolist.deleteTask.title}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmRemoveTodo}
      />

      <ConfirmModal
        buttonCancel={dict.todolist.editTask.cancel}
        buttonConfirm={dict.todolist.editTask.submit}
        description={dict.todolist.editTask.description}
        isOpen={showEditModal}
        title={dict.todolist.editTask.title}
        onCancel={() => setShowEditModal(false)}
        onConfirm={confirmUpdateTodo}
      />

      {moveSubtaskId && (
        <Modal
          isDismissable
          isOpen={!!moveSubtaskId}
          onClose={() => setMoveSubtaskId(null)}
        >
          <ModalContent>
            <ModalHeader>{dict.todolist.subtasks.move_title}</ModalHeader>
            <ModalBody>
              <Select
                defaultSelectedKeys={moveTargetTodoId}
                label={dict.todolist.subtasks.move_to}
                onChange={(e) => setMoveTargetTodoId(e.target.value)}
              >
                {todos
                  .filter((t) => t.id !== todo.id)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                size="lg"
                variant="ghost"
                onPress={() => setMoveSubtaskId(null)}
              >
                {dict.todolist.editTask.cancel}
              </Button>
              <Button size="lg" variant="primary" onPress={confirmMoveSubtask}>
                {dict.todolist.subtasks.move_confirm}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}

export default TodoItem
