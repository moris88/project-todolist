import { Chip, Select, SelectItem } from '@heroui/react'
import { useAtom } from 'jotai'
import moment from 'moment'
import React from 'react'

import { todoListAtom } from '@/atoms'
import { useNotificationRequest } from '@/hooks'
import { dict, isTaskOverdue } from '@/utils'

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

function TodoList() {
  const [todos, setTodos] = useAtom(todoListAtom)
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
      setTodos(newTodos)
      localStorage.setItem('todos', JSON.stringify(newTodos))
    }
  }, [notifyUser, setTodos, todos])

  // Recupero dei task da localStorage quando la pagina si carica
  React.useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [setTodos])

  return (
    <div className="mt-4 space-y-4">
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
      {todos.length === 0 ? (
        <p className="select-none text-center">
          {dict.todolist.listitem.no_task}
        </p>
      ) : (
        todos
          .filter((todo) => {
            // Filtro per task completati
            if (filter === '2') {
              return todo.completed
            }
            // Filtro per task da completare
            if (filter === '3') {
              return !todo.completed
            }
            // Filtro per task scaduti
            if (filter === '4') {
              return isTaskOverdue(todo.dueDate)
            }
            // Filtro per task non scaduti
            if (filter === '5') {
              return !isTaskOverdue(todo.dueDate)
            }
            return true
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
