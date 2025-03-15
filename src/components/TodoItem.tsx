import {
  Button,
  ButtonGroup,
  Checkbox,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react'
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  today,
} from '@internationalized/date'
import { useAtom } from 'jotai'
import React from 'react'
import { BiSolidDetail } from 'react-icons/bi'
import {
  HiFlag,
  HiMiniTrash,
  HiOutlineFlag,
  HiOutlinePencilSquare,
} from 'react-icons/hi2'

import { todoListAtom } from '@/atoms/atoms'
import { ConfirmModal } from '@/components'
import { Priority, Todo } from '@/types'
import { dict, priorityItems } from '@/utils'

interface TodoItemProps {
  todo: Todo
}

function TodoItem({ todo }: TodoItemProps) {
  const [todos, setTodos] = useAtom(todoListAtom)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editTitle, setEditTitle] = React.useState(todo.title)
  const [editDescription, setEditDescription] = React.useState(todo.description)
  const [editPriority, setEditPriority] = React.useState<Priority>(
    todo.priority
  )
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDetailModal, setShowDetailModal] = React.useState(false)

  const minValue = today(getLocalTimeZone()) as any
  const [editDueDate, setEditDueDate] = React.useState<string | null>(
    todo.dueDate ?? null
  )

  const valueDueDate = React.useMemo(() => {
    if (editDueDate) {
      const parseDate = parseAbsoluteToLocal(editDueDate)
      return parseDate
    }
    return undefined
  }, [editDueDate])

  const toggleTodo = (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const updatedTodos = todos.map((t) => {
      if (t.id === todo.id) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })
    localStorage.setItem('todos', JSON.stringify(updatedTodos))
    setTodos(updatedTodos)
  }

  const removeTodo = () => {
    setShowDeleteModal(true)
  }

  const confirmRemoveTodo = () => {
    const updatedTodos = todos.filter((t) => t.id !== todo.id)
    localStorage.setItem('todos', JSON.stringify(updatedTodos))
    setTodos(updatedTodos)
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
          dueDate: editDueDate ? editDueDate.toString() : null,
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })
    setTodos(updatedTodos)
    localStorage.setItem('todos', JSON.stringify(updatedTodos))
    setIsEditing(false)
    setShowEditModal(false)
  }

  const handleSetDueDate = (value: any) => {
    setEditDueDate(value.toDate().toISOString())
  }

  const flagIcon: Record<string, React.ReactNode> = {
    low: <HiFlag className="h-3 w-3 text-green-600" />,
    medium: <></>,
    high: <HiFlag className="h-3 w-3 text-yellow-600" />,
    urgent: <HiFlag className="h-3 w-3 text-red-600" />,
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

  return (
    <div className="flex w-full flex-col items-start justify-start gap-y-2 py-2 md:flex-row md:items-center md:justify-between">
      {isEditing ? (
        <div className="flex w-full flex-col gap-y-4">
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
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
              value={valueDueDate as any}
              onChange={handleSetDueDate}
            />
            <Select
              defaultSelectedKeys={priorityItems
                .indexOf(editPriority)
                .toString()}
              label={dict.todolist.listitem.priority.label}
              onChange={(e) => handlePriorityChange(e.target.value)}
            >
              {priorityItems.map((item, index) => {
                const flagIcon: Record<number, React.ReactNode> = {
                  3: <HiFlag className="h-3 w-3 text-green-600" />,
                  2: <HiOutlineFlag className="h-3 w-3" />,
                  1: <HiFlag className="h-3 w-3 text-yellow-600" />,
                  0: <HiFlag className="h-3 w-3 text-red-600" />,
                }
                return (
                  <SelectItem key={index} startContent={flagIcon[index]}>
                    {
                      dict.todolist.listitem.priority.items[
                        item as keyof typeof dict.todolist.listitem.priority.items
                      ]
                    }
                  </SelectItem>
                )
              })}
            </Select>
            <ButtonGroup>
              <Button size="lg" onPress={() => setIsEditing(false)}>
                {dict.todolist.editTask.cancel}
              </Button>
              <Button color="warning" size="lg" onPress={updateTodo}>
                {dict.todolist.editTask.submit}
              </Button>
            </ButtonGroup>
          </div>
          <Textarea
            className="w-full"
            label={dict.todolist.addTask.label}
            maxRows={10}
            minRows={5}
            size="lg"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </div>
      ) : (
        <>
          <div className="flex w-full flex-col items-start gap-y-2">
            <p
              className={`line-clamp-1 flex w-full cursor-pointer items-center gap-2 font-bold ${todo.completed ? 'line-through' : ''}`}
              onClick={toggleTodo}
            >
              <Checkbox isSelected={todo.completed} />
              {flagIcon[todo.priority]}{' '}
              <span
                className={
                  todo.completed
                    ? 'text-green-600'
                    : todo.dueDate && new Date(todo.dueDate) < new Date()
                      ? 'text-red-600'
                      : todo.priority === 'urgent'
                        ? 'text-black'
                        : ''
                }
              >
                {todo.title}
              </span>
            </p>
          </div>
          <ButtonGroup>
            <Button
              color="primary"
              isDisabled={todo.description === '' || todo.description === null}
              size="sm"
              onPress={() => setShowDetailModal(true)}
            >
              <BiSolidDetail className="h-3 w-3" />
              <span className="hidden md:inline">
                {dict.todolist.listitem.detail}
              </span>
            </Button>
            <Button
              color="primary"
              isDisabled={todo.completed}
              size="sm"
              onPress={() => setIsEditing(true)}
            >
              <HiOutlinePencilSquare className="h-3 w-3" />
              <span className="hidden md:inline">
                {dict.todolist.listitem.edit}
              </span>
            </Button>
            <Button color="danger" size="sm" onPress={removeTodo}>
              <HiMiniTrash className="h-3 w-3" />
              <span className="hidden md:inline">
                {dict.todolist.listitem.delete}
              </span>
            </Button>
          </ButtonGroup>
        </>
      )}

      {/* Modale per confermare l'eliminazione */}
      <ConfirmModal
        description={todo.description}
        isOpen={showDetailModal}
        title={todo.title}
        onCancel={() => setShowDetailModal(false)}
      />

      {/* Modale per confermare l'eliminazione */}
      <ConfirmModal
        buttonCancel={dict.todolist.deleteTask.cancel}
        buttonConfirm={dict.todolist.deleteTask.delete}
        colorConfirm="danger"
        description={dict.todolist.deleteTask.description}
        isOpen={showDeleteModal}
        title={dict.todolist.deleteTask.title}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmRemoveTodo}
      />

      {/* Modale per confermare la modifica */}
      <ConfirmModal
        buttonCancel={dict.todolist.editTask.cancel}
        buttonConfirm={dict.todolist.editTask.submit}
        colorConfirm="primary"
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
