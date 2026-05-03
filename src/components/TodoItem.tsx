import { useAtom } from 'jotai'
import React from 'react'
import { BiSolidDetail } from 'react-icons/bi'
import { GoAlertFill } from 'react-icons/go'
import { HiFlag, HiMiniTrash, HiOutlinePencilSquare } from 'react-icons/hi2'

import { todoListAtom } from '@/atoms/atoms'
import { ConfirmModal } from '@/components'
import {
  Button,
  ButtonGroup,
  Checkbox,
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
  dict,
  isTaskOverdue,
  priorityItems,
  removeTodoStorage,
  updateTodoStorage,
} from '@/utils'

interface TodoItemProps {
  todo: Todo
  kanban?: boolean
}

function TodoItem({ todo, kanban }: TodoItemProps) {
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
  const [editDueDate, setEditDueDate] = React.useState<string | null>(
    todo.dueDate ?? null
  )

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
            </div>
          </ModalBody>
          <ModalFooter>
            <Button size="lg" onPress={() => setIsEditing(false)}>
              {dict.todolist.editTask.cancel}
            </Button>
            <Button color="warning" size="lg" onPress={updateTodo}>
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
            <div onPointerDown={(e) => e.stopPropagation()}>
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
                      ? 'text-black'
                      : ''
              } ${kanban ? 'max-w-[70%]' : 'max-w-[80%]'} overflow-hidden text-ellipsis`}
            >
              {todo.title}
            </span>
          </div>
        </div>
        <div
          className="flex justify-start"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ButtonGroup>
            <Button
              color="primary"
              isDisabled={todo.description === '' || todo.description === null}
              size="sm"
              onPress={() => setShowDetailModal(true)}
            >
              <BiSolidDetail className="h-3 w-3" />
            </Button>
            <Button
              color="warning"
              isDisabled={todo.completed}
              size="sm"
              onPress={() => setIsEditing(true)}
            >
              <HiOutlinePencilSquare className="h-3 w-3" />
            </Button>
            <Button color="danger" size="sm" onPress={removeTodo}>
              <HiMiniTrash className="h-3 w-3" />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <ConfirmModal
        description={todo.description}
        isOpen={showDetailModal}
        title={todo.title}
        onCancel={() => setShowDetailModal(false)}
      />

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
