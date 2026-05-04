import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import moment from 'moment'
import React from 'react'
import { createPortal } from 'react-dom'
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai'
import { GoAlertFill } from 'react-icons/go'
import { HiFlag } from 'react-icons/hi2'

import { commentsAtom, dictAtom, todoListAtom } from '@/atoms'
import { Comments } from '@/components'
import { Button, Chip, Select, SelectItem, Switch } from '@/components/UI'
import { useNotificationRequest } from '@/hooks'
import { Todo } from '@/types'
import { getCommentsStorage, getTodosStorage, isTaskOverdue, updateTodoStorage } from '@/utils'

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
  const dict = useAtomValue(dictAtom)

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
        ref={setNodeRef}
        className={`relative rounded-xl border ${todo.completed ? 'bg-green-100 dark:bg-green-900/30' : todo.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'} p-2`}
      >
        <div
          className="absolute right-2 top-2 z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Button size="sm" variant="ghost" onPress={() => setOnClicked(false)}>
            <AiOutlineFullscreenExit className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col">
          <div {...attributes} {...listeners} className="cursor-grab">
            <TodoItem kanban todo={todo} />
          </div>
          <div className="flex flex-col items-start px-2 pb-2">
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
      className={`flex items-center justify-between rounded-xl border ${todo.completed ? 'bg-green-100 dark:bg-green-900/30 dark:text-green-100' : todo.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30 dark:text-red-100' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100'} p-2`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex flex-1 cursor-grab items-center gap-2 overflow-hidden text-ellipsis"
      >
        {overdue[isTaskOverdue(todo.dueDate) ? 'true' : 'false']}
        {flagIcon[todo.priority]}
        {todo.title}
      </div>
      <div onPointerDown={(e) => e.stopPropagation()}>
        <Button size="sm" variant="ghost" onPress={() => setOnClicked(true)}>
          <AiOutlineFullscreen className="h-6 w-6" />
        </Button>
      </div>
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
      className={`max-h-[calc(100vh-250px)] min-h-[calc(100vh-250px)] w-full overflow-y-auto rounded p-4 md:w-1/3 ${isOver ? 'bg-blue-300 dark:bg-blue-900/50' : 'bg-gray-200 dark:bg-gray-700/60'}`}
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
  const [, setComments] = useAtom(commentsAtom)
  const dict = useAtomValue(dictAtom)
  const [activeTask, setActiveTask] = React.useState<Todo | null>(null)
  const [overColumn, setOverColumn] = React.useState(null)
  const [filter, setFilter] = React.useState('1')
  const [showDescriptions, setShowDescriptions] = React.useState(false)
  const [selectedTodoId, setSelectedTodoId] = React.useState<string | null>(null)
  const { notifyUser } = useNotificationRequest()

  React.useEffect(() => {
    setComments(getCommentsStorage())
  }, [setComments])

  React.useEffect(() => {
    const newTodos = todos.map((todo) => {
      if (!todo.dueDate) return todo

      const dueDate = new Date(todo.dueDate)

      if (!todo.completed && dueDate < new Date() && !todo.notify) {
        notifyUser('Task Scaduto', `Il task "${todo.title}" è scaduto.`)
        return { ...todo, notify: true }
      }

      return todo
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

  React.useEffect(() => {
    setTodos(getTodosStorage())
  }, [setTodos])

  const filterItems = [
    { label: dict.todolist.listitem.filter.all_kanban, key: '0' },
    { label: dict.todolist.listitem.filter.all, key: '1' },
    { label: dict.todolist.listitem.filter.completed, key: '2' },
    { label: dict.todolist.listitem.filter.uncompleted, key: '3' },
    { label: dict.todolist.listitem.filter.overdue, key: '4' },
    { label: dict.todolist.listitem.filter.not_overdue, key: '5' },
  ]

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
            label={dict.todolist.listitem.filter.label}
            onChange={(e) => setFilter(e.target.value)}
          >
            {filterItems.map((item) => (
              <SelectItem key={item.key} value={item.key}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
          {filter !== '0' && (
            <div className="hidden md:flex md:shrink-0 md:items-center">
              <Switch
                checked={showDescriptions}
                onChange={(e) => setShowDescriptions(e.target.checked)}
              >
                {dict.todolist.listitem.show_descriptions}
              </Switch>
            </div>
          )}
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
                  <div className="rounded border bg-gray-300 p-2 shadow-lg dark:bg-gray-600 dark:text-white">
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
              className={`rounded-lg ${todo.priority !== 'urgent' ? 'bg-gray-200 hover:shadow-slate-500 dark:bg-slate-600 dark:text-white' : 'bg-red-100 text-black hover:shadow-red-500 dark:bg-red-900/40 dark:text-red-100'} p-2 hover:shadow-lg md:p-5`}
            >
              <TodoItem
                isCommentOpen={selectedTodoId === todo.id}
                showDescriptions={showDescriptions}
                todo={todo}
                onCommentPress={() =>
                  setSelectedTodoId((prev) => (prev === todo.id ? null : todo.id))
                }
              />
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
              {selectedTodoId === todo.id && <Comments todoId={todo.id} />}
            </div>
          ))
      )}
      <DangerZone setTodos={setTodos} todos={todos} />
    </div>
  )
}

export default TodoList
