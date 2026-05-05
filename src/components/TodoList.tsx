import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import React from 'react'

import { commentsAtom, dictAtom, todoListAtom } from '@/atoms'
import { Comments } from '@/components'
import { Select, SelectItem, Switch } from '@/components/UI'
import { useNotificationRequest } from '@/hooks'
import {
  filterTodoByStatus,
  getCommentsStorage,
  getTodosStorage,
  orderTodos,
  updateTodoStorage,
} from '@/utils'

import DangerZone from './DangerZone'
import TodoItem from './TodoItem'

function TodoList() {
  const [todos, setTodos] = useAtom(todoListAtom)
  const [comments, setComments] = useAtom(commentsAtom)
  const dict = useAtomValue(dictAtom)
  const [filter, setFilter] = React.useState('0')
  const [showDescriptions, setShowDescriptions] = React.useState(false)
  const [showSubtasks, setShowSubtasks] = React.useState(false)
  const [selectedTodoId, setSelectedTodoId] = React.useState<string | null>(
    null
  )
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

  React.useEffect(() => {
    setTodos(getTodosStorage())
  }, [setTodos])

  const filterItems = [
    { label: dict.todolist.listitem.filter.all, key: '0' },
    { label: dict.todolist.listitem.filter.todo, key: '1' },
    { label: dict.todolist.listitem.filter.progress, key: '2' },
    { label: dict.todolist.listitem.filter.review, key: '3' },
    { label: dict.todolist.listitem.filter.testing, key: '4' },
    { label: dict.todolist.listitem.filter.blocked, key: '5' },
    { label: dict.todolist.listitem.filter.paused, key: '6' },
    { label: dict.todolist.listitem.filter.done, key: '7' },
    { label: dict.todolist.listitem.filter.uncompleted, key: '8' },
    { label: dict.todolist.listitem.filter.overdue, key: '9' },
    { label: dict.todolist.listitem.filter.not_overdue, key: '10' },
  ]

  return (
    <div className="mt-4 space-y-4" id="todo-list">
      {todos.length > 0 && (
        <div className="flex w-full flex-col items-end justify-center gap-4 gap-y-2 lg:flex-row">
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
          <div className="hidden md:flex md:shrink-0 md:flex-col md:gap-1">
            <Switch
              checked={showDescriptions}
              onChange={(e) => setShowDescriptions(e.target.checked)}
            >
              {dict.todolist.listitem.show_descriptions}
            </Switch>
            <Switch
              checked={showSubtasks}
              onChange={(e) => setShowSubtasks(e.target.checked)}
            >
              {dict.todolist.listitem.show_subtasks}
            </Switch>
          </div>
        </div>
      )}
      {todos.filter((todo) => filterTodoByStatus(todo, filter)).length === 0 ? (
        <p className="select-none text-center">
          {dict.todolist.listitem.no_task}
        </p>
      ) : (
        todos
          .filter((todo) => filterTodoByStatus(todo, filter))
          .sort(orderTodos)
          .map((todo) => (
            <div
              key={todo.id}
              className={`rounded-lg ${todo.priority !== 'urgent' ? 'bg-gray-200 hover:shadow-slate-500 dark:bg-slate-600 dark:text-white' : 'bg-red-100 text-black hover:shadow-red-500 dark:bg-red-900/40 dark:text-red-100'} p-2 hover:shadow-lg md:p-5`}
            >
              <TodoItem
                isCommentOpen={selectedTodoId === todo.id}
                showDescriptions={showDescriptions}
                showSubtasks={showSubtasks}
                todo={todo}
                onCommentPress={() =>
                  setSelectedTodoId((prev) =>
                    prev === todo.id ? null : todo.id
                  )
                }
              />
              {selectedTodoId === todo.id && <Comments todoId={todo.id} />}
            </div>
          ))
      )}
      <DangerZone
        comments={comments}
        setComments={setComments}
        setTodos={setTodos}
        todos={todos}
      />
    </div>
  )
}

export default TodoList
