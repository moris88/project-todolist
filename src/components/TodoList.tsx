import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { Button, Chip, Select, SelectItem } from '@heroui/react'
import { useAtom } from 'jotai'
import moment from 'moment'
import React from 'react'
import { createPortal } from 'react-dom'
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai'
import { GoAlertFill } from 'react-icons/go'
import { HiFlag } from 'react-icons/hi2'

import { todoListAtom } from '@/atoms'
import { useNotificationRequest } from '@/hooks'
import { Todo } from '@/types'
import {
  dict,
  getTodosStorage,
  isTaskOverdue,
  updateTodoStorage,
} from '@/utils'

import DangerZone from './DangerZone'
import TodoItem from './TodoItem'

function Separated() {
  return (
    <span className="hidden md:inline">
      &nbsp;
      {'-'}
      &nbsp;
    </span>
  )
}

function DraggableItem({ todo }: { todo: Todo }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: todo.id })
  const [onClicked, setOnClicked] = React.useState(false)

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

  if (onClicked) {
    return (
      <div
        className={`relative cursor-grab rounded-xl border ${todo.completed ? 'bg-green-100' : todo.priority === 'urgent' ? 'bg-red-100' : 'bg-gray-100'} p-2`}
      >
        <Button
          className="absolute right-2 top-2"
          size="sm"
          variant="light"
          onPress={() => setOnClicked(false)}
        >
          <AiOutlineFullscreenExit className="h-6 w-6" />
        </Button>
        <div className="flex flex-col">
          <TodoItem kanban todo={todo} />
          <div className="flex flex-col items-start">
            {todo.createdAt && (
              <span>
                {dict.todolist.listitem.createdAt}:{' '}
                {moment(todo.createdAt).format('DD/MM/YYYY HH:mm')}
              </span>
            )}
            {todo.updatedAt && (
              <span>
                {dict.todolist.listitem.updatedAt}:{' '}
                {moment(todo.updatedAt).format('DD/MM/YYYY HH:mm')}
              </span>
            )}
            {todo.completed && (
              <Chip color="success" size="sm">
                {dict.todolist.listitem.completedAt}:{' '}
                {moment(todo.completedAt).format('DD/MM/YYYY HH:mm')}
              </Chip>
            )}
            {todo.dueDate && !todo.completed && (
              <Chip
                color={isTaskOverdue(todo.dueDate) ? 'danger' : 'warning'}
                size="sm"
              >
                {isTaskOverdue(todo.dueDate)
                  ? dict.todolist.listitem.expired
                  : dict.todolist.listitem.dueDateAt}
                : {moment(todo.dueDate).format('DD/MM/YYYY HH:mm')}
              </Chip>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex cursor-grab items-center justify-between rounded-xl border ${todo.completed ? 'bg-green-100' : todo.priority === 'urgent' ? 'bg-red-100' : 'bg-gray-100'} p-2`}
    >
      <span className="flex max-w-[80%] items-center gap-2 overflow-hidden text-ellipsis">
        {overdue[isTaskOverdue(todo.dueDate) ? 'true' : 'false']}
        {flagIcon[todo.priority]}
        {todo.title}
      </span>
      <Button size="sm" variant="light" onPress={() => setOnClicked(true)}>
        <AiOutlineFullscreen className="h-6 w-6" />
      </Button>
    </div>
  )
}

function DroppableColumn({
  id,
  title,
  todos,
  isOver,
}: {
  id: string
  title: string
  todos: Todo[]
  isOver?: boolean
}) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`max-h-[calc(100vh-250px)] min-h-[calc(100vh-250px)] w-full overflow-y-auto rounded bg-gray-200 p-4 md:w-1/3 ${isOver ? 'bg-blue-300' : 'bg-gray-200'}`}
    >
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      {todos
        .sort((a, b) => {
          if (a.completed && !b.completed) return 1
          if (!a.completed && b.completed) return -1
          if (isTaskOverdue(a.dueDate) && !isTaskOverdue(b.dueDate)) return -1
          if (!isTaskOverdue(a.dueDate) && isTaskOverdue(b.dueDate)) return 1
          if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
          if (a.priority !== 'urgent' && b.priority === 'urgent') return 1
          if (a.priority === 'high' && b.priority !== 'high') return -1
          if (a.priority !== 'high' && b.priority === 'high') return 1
          if (a.priority === 'medium' && b.priority === 'medium') return -1
          if (a.priority !== 'medium' && b.priority === 'medium') return 1
          if (a.priority === 'low' && b.priority === 'low') return -1
          if (a.priority !== 'low' && b.priority === 'low') return 1
          return 0
        })
        .map((todo) => (
          <DraggableItem key={todo.id} todo={todo} />
        ))}
    </div>
  )
}

function TodoList() {
  const [todos, setTodos] = useAtom(todoListAtom)
  const [activeTask, setActiveTask] = React.useState<Todo | null>(null)
  const [overColumn, setOverColumn] = React.useState(null)
  const [filter, setFilter] = React.useState('1')
  const { notifyUser } = useNotificationRequest()

  // Notifica all'utente quando un task è scaduto
  React.useEffect(() => {
    const newTodos = todos.map((todo) => {
      if (!todo.dueDate) {
        return todo // Se non c'è una data di scadenza, non modificare l'oggetto
      }

      const dueDate = new Date(todo.dueDate)

      if (!todo.completed && dueDate < new Date() && !todo.notify) {
        notifyUser('Task Scaduto', `Il task "${todo.title}" è scaduto.`)
        return { ...todo, notify: true } // Solo in questo caso modifichiamo il todo
      }

      return todo // Se non è necessario modificare, restituiamo il todo così com'è
    })
    const isDifferent = JSON.stringify(newTodos) !== JSON.stringify(todos)

    if (isDifferent) {
      setTodos(updateTodoStorage(newTodos))
    }
  }, [notifyUser, setTodos, todos])

  const handleDragStart = (event: any) => {
    const todo = todos.find((t) => t.id === event.active.id)
    setActiveTask(todo || null)
  }

  const handleDragOver = (event: any) => {
    if (event.over) {
      setOverColumn(event.over.id)
    } else {
      setOverColumn(null)
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over) return

    setTodos((prev) =>
      prev.map((task) =>
        task.id === active.id ? { ...task, category: over.id } : task
      )
    )
    setActiveTask(null)
    setOverColumn(null)
  }

  // Recupero dei task da localStorage quando la pagina si carica
  React.useEffect(() => {
    setTodos(getTodosStorage())
  }, [setTodos])

  return (
    <div className="mt-4 space-y-4" id="todo-list">
      <div className="flex justify-center">
        <h2 className="text-2xl font-semibold">
          {dict.todolist.listitem.title}
        </h2>
      </div>

      {todos.length > 0 && (
        <div className="flex w-full flex-col items-center justify-center gap-4 gap-y-2 lg:flex-row">
          <Select
            defaultSelectedKeys={filter}
            items={[
              { label: dict.todolist.listitem.filter.all_kanban, key: '0' },
              { label: dict.todolist.listitem.filter.all, key: '1' },
              { label: dict.todolist.listitem.filter.completed, key: '2' },
              { label: dict.todolist.listitem.filter.uncompleted, key: '3' },
              { label: dict.todolist.listitem.filter.overdue, key: '4' },
              { label: dict.todolist.listitem.filter.not_overdue, key: '5' },
            ]}
            label={dict.todolist.listitem.filter.label}
            onChange={(value) => setFilter(value.target.value)}
          >
            {(filter) => (
              <SelectItem key={filter.key}>{filter.label}</SelectItem>
            )}
          </Select>
        </div>
      )}
      {filter === '0' && (
        <div className="flex min-h-[calc(100vh-250px)] w-full flex-col items-center gap-4 md:flex-row">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
          >
            <DroppableColumn
              id="todo"
              isOver={overColumn === 'todo'}
              title={dict.todolist.listitem.category.items.todo}
              todos={todos.filter((todo) => todo.category === 'todo')}
            />
            <DroppableColumn
              id="inProgress"
              isOver={overColumn === 'inProgress'}
              title={dict.todolist.listitem.category.items.inProgress}
              todos={todos.filter((todo) => todo.category === 'inProgress')}
            />
            <DroppableColumn
              id="done"
              isOver={overColumn === 'done'}
              title={dict.todolist.listitem.category.items.done}
              todos={todos.filter((todo) => todo.category === 'done')}
            />
            {createPortal(
              <DragOverlay>
                {activeTask ? (
                  <div className="rounded border bg-gray-300 p-2 shadow-lg">
                    {activeTask.title}
                  </div>
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </div>
      )}
      {todos.length === 0 ? (
        <p className="select-none text-center">
          {dict.todolist.listitem.no_task}
        </p>
      ) : (
        todos
          .filter((todo) => {
            switch (filter) {
              case '0':
                return false
              case '1':
                return true
              case '2':
                return todo.completed
              case '3':
                return !todo.completed
              case '4':
                return isTaskOverdue(todo.dueDate)
              case '5':
                return !isTaskOverdue(todo.dueDate)
              default:
                return false
            }
          })
          .sort((a, b) => {
            if (a.completed && !b.completed) return 1
            if (!a.completed && b.completed) return -1
            if (isTaskOverdue(a.dueDate) && !isTaskOverdue(b.dueDate)) return -1
            if (!isTaskOverdue(a.dueDate) && isTaskOverdue(b.dueDate)) return 1
            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
            if (a.priority !== 'urgent' && b.priority === 'urgent') return 1
            if (a.priority === 'high' && b.priority !== 'high') return -1
            if (a.priority !== 'high' && b.priority === 'high') return 1
            if (a.priority === 'medium' && b.priority === 'medium') return -1
            if (a.priority !== 'medium' && b.priority === 'medium') return 1
            if (a.priority === 'low' && b.priority === 'low') return -1
            if (a.priority !== 'low' && b.priority === 'low') return 1
            return 0
          })
          .map((todo) => (
            <div
              key={todo.id}
              className={`rounded-lg ${todo.priority !== 'urgent' ? 'bg-gray-200 hover:shadow-slate-500 dark:bg-slate-600' : 'bg-red-100 !text-black hover:shadow-red-500'} p-2 hover:shadow-lg md:p-5`}
            >
              <TodoItem todo={todo} />
              <small className="flex flex-col items-start md:flex-row md:items-center">
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
            </div>
          ))
      )}
      {todos.length > 0 && <DangerZone setTodos={setTodos} todos={todos} />}
    </div>
  )
}

export default TodoList
