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
import { ConfirmModal, MarkdownContent } from '@/components'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
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
import { Category, Priority, Todo } from '@/types'
import {
  isTaskOverdue,
  priorityItems,
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
  const [editTitle, setEditTitle] = React.useState(todo.title)
  const [editDescription, setEditDescription] = React.useState(todo.description)
  const [editPriority, setEditPriority] = React.useState<Priority>(
    todo.priority
  )
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showInlineDetail, setShowInlineDetail] = React.useState(false)
  const [editDueDate, setEditDueDate] = React.useState<string | null>(
    todo.dueDate ?? null
  )
  const [markdownPreview, setMarkdownPreview] = React.useState(false)

  const minValue = new Date().toISOString().slice(0, 16)

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

  const updateTodo = () => {
    setShowEditModal(true)
  }

  const confirmUpdateTodo = () => {
    const updatedTodos = todos.map((t) => {
      if (t.id === todo.id) {
        return {
          ...t,
          dueDate: editDueDate ?? null,
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })
    setTodos(updateTodoStorage(updatedTodos))
    setIsEditing(false)
    setShowEditModal(false)
  }

  const handlePriorityChange = (value: string) => {
    const mappaPriority: Record<string, string> = {
      '0': 'urgent',
      '1': 'high',
      '2': 'medium',
      '3': 'low',
    }
    setEditPriority(mappaPriority[value] as Priority)
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
      <Modal
        isDismissable={false}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      >
        <ModalContent>
          <ModalHeader>{dict.todolist.editTask.info}</ModalHeader>
          <ModalBody>
            <div className="flex w-full flex-col gap-y-4">
              <div className="flex w-full flex-col items-center gap-4">
                <Input
                  className="w-full"
                  label={dict.todolist.editTask.title}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <DatePicker
                  showMonthAndYearPickers
                  className="w-full"
                  granularity="minute"
                  label={dict.todolist.addTask.due_date}
                  minValue={minValue}
                  value={editDueDate}
                  onChange={(iso) => setEditDueDate(iso)}
                />
                <Select
                  defaultSelectedKeys={priorityItems
                    .indexOf(editPriority)
                    .toString()}
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
                  defaultSelectedKeys={todo.category}
                  label={dict.todolist.listitem.category.label}
                  onChange={(e) => {
                    const updatedTodos = todos.map((t) => {
                      if (t.id === todo.id) {
                        return {
                          ...t,
                          completed: e.target.value === 'done' ? true : false,
                          completedAt:
                            e.target.value === 'done'
                              ? new Date().toISOString()
                              : null,
                          category: e.target.value as Category,
                        }
                      }
                      return t
                    })
                    setTodos(updateTodoStorage(updatedTodos))
                  }}
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
              </div>
              <div className="flex w-full flex-col gap-y-2">
                <div className="flex gap-x-2">
                  <button
                    className={`rounded-t px-3 py-1 text-sm font-medium transition-colors ${!markdownPreview ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    type="button"
                    onClick={() => setMarkdownPreview(false)}
                  >
                    Modifica
                  </button>
                  <button
                    className={`rounded-t px-3 py-1 text-sm font-medium transition-colors ${markdownPreview ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    type="button"
                    onClick={() => setMarkdownPreview(true)}
                  >
                    Anteprima
                  </button>
                </div>
                {markdownPreview ? (
                  <div className="min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                    {editDescription ? (
                      <MarkdownContent content={editDescription} />
                    ) : (
                      <span className="text-sm italic text-gray-400">
                        Nessun contenuto da visualizzare
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
                    value={editDescription}
                    onChange={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setEditDescription(e.target.value)
                    }}
                  />
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button size="lg" onPress={() => setIsEditing(false)}>
              {dict.todolist.editTask.cancel}
            </Button>
            <Button size="lg" variant="primary" onPress={updateTodo}>
              {dict.todolist.editTask.submit}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
