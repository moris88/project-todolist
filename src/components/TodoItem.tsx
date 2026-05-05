import { useAtom, useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { BiSolidDetail } from 'react-icons/bi'
import { GoAlertFill } from 'react-icons/go'
import {
  HiChatBubbleLeftEllipsis,
  HiFlag,
  HiMiniTrash,
  HiOutlinePencilSquare,
} from 'react-icons/hi2'

import { commentsAtom, dictAtom, todoListAtom } from '@/atoms/atoms'
import { ConfirmModal, MarkdownContent, TaskFormModal, TaskFormValues } from '@/components'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
} from '@/components/UI'
import { Todo } from '@/types'
import {
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
  onCommentPress?: () => void
  isCommentOpen?: boolean
}

function TodoItem({
  todo,
  kanban,
  showDescriptions,
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
  const [pendingEditValues, setPendingEditValues] = React.useState<TaskFormValues | null>(null)

  const toggleTodo = (
    e?: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const updatedTodos = todos.map((t) => {
      if (t.id === todo.id) {
        return {
          ...t,
          category: !t.completed ? 'done' : todo.category,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : null,
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
          category: pendingEditValues.category,
          completed: pendingEditValues.category === 'done' ? true : t.completed,
          completedAt: pendingEditValues.category === 'done' && !t.completed ? new Date().toISOString() : t.completedAt,
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
        showCategory
        cancelLabel={dict.todolist.editTask.cancel}
        headerLabel={dict.todolist.editTask.info}
        initialValues={{
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          dueDate: todo.dueDate,
          category: todo.category,
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
            className={`line-clamp-1 flex w-full cursor-pointer items-center gap-2 font-bold ${todo.completed ? 'line-through' : ''}`}
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
          className="flex flex-col justify-start gap-y-4 md:flex-row md:justify-between"
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
              isDisabled={todo.description === '' || todo.description === null}
              size="sm"
              variant={showInlineDetail ? 'secondary' : 'primary'}
              onPress={() => setShowInlineDetail((prev) => !prev)}
            >
              <BiSolidDetail className="h-3 w-3 md:h-5 md:w-5" />
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
    </div>
  )
}

export default TodoItem
