import { Button, ButtonGroup, Switch } from '@heroui/react'
import React from 'react'

import { ConfirmModal } from '@/components'
import { Todo } from '@/types'
import { dict, isTaskOverdue } from '@/utils'

interface DangerZoneProps {
  todos: Todo[]
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}

function DangerZone({ todos, setTodos }: DangerZoneProps) {
  const [showDangerZone, setShowDangerZone] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState<{
    completed: boolean
    expired: boolean
    all: boolean
  }>({
    completed: false,
    expired: false,
    all: false,
  })

  const clearCompleted = () => {
    const newTodos = todos.filter((todo) => !todo.completed)
    setTodos(newTodos)
    localStorage.setItem('todos', JSON.stringify(newTodos))
  }

  const clearExpired = () => {
    const newTodos = todos.filter((todo) => !isTaskOverdue(todo.dueDate))
    setTodos(newTodos)
    localStorage.setItem('todos', JSON.stringify(newTodos))
  }

  const clearAll = () => {
    setTodos([])
    localStorage.removeItem('todos')
  }

  const handleDelete = (key: keyof typeof showDeleteModal) => {
    setShowDeleteModal({ ...showDeleteModal, [key]: true })
  }

  const buttons: {
    key: 'completed' | 'expired' | 'all'
    text: string
    message: string
  }[] = [
    {
      key: 'completed',
      text: dict.todolist.listitem.filter.buttons.clear_completed.label,
      message: dict.todolist.listitem.filter.buttons.clear_completed.message,
    },
    {
      key: 'expired',
      text: dict.todolist.listitem.filter.buttons.clear_expired.label,
      message: dict.todolist.listitem.filter.buttons.clear_expired.message,
    },
    {
      key: 'all',
      text: dict.todolist.listitem.filter.buttons.clear_all.label,
      message: dict.todolist.listitem.filter.buttons.clear_all.message,
    },
  ]

  return (
    <>
      <div
        className={`${showDangerZone ? 'rounded-lg bg-red-200 p-1 hover:shadow-lg hover:shadow-red-500 md:p-5' : ''}`}
      >
        <div className="flex dark:text-black">
          <Switch
            checked={showDangerZone}
            color="danger"
            size="sm"
            onChange={(e) => setShowDangerZone(e.target.checked)}
          >
            <span className="font-bold text-red-600">Danger Zone</span>
          </Switch>
        </div>
        {showDangerZone && (
          <>
            <div className="hidden w-full flex-col items-center justify-center md:flex">
              <p className="py-5 font-bold text-black">
                {dict.todolist.listitem.filter.buttons.message}
              </p>
              <ButtonGroup>
                {buttons.map((button) => (
                  <Button
                    key={button.key}
                    color="danger"
                    size="lg"
                    onPress={() => handleDelete(button.key)}
                  >
                    {button.text}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
            <div className="my-10 flex w-full flex-col items-center justify-center gap-y-2 md:hidden">
              <p className="py-5 font-bold text-black">
                {dict.todolist.listitem.filter.buttons.message}
              </p>
              {buttons.map((button) => (
                <Button
                  key={button.key}
                  color="danger"
                  size="sm"
                  onPress={() => handleDelete(button.key)}
                >
                  {button.text}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Modale per confermare l'eliminazione */}
      {Object.keys(showDeleteModal).map((key) => (
        <ConfirmModal
          key={key}
          buttonCancel={dict.todolist.deleteTask.cancel}
          buttonConfirm={dict.todolist.deleteTask.delete}
          colorConfirm="danger"
          description={
            buttons.find((button) => button.key === key)?.message ?? ''
          }
          isOpen={showDeleteModal[key as keyof typeof showDeleteModal]}
          title={buttons.find((button) => button.key === key)?.text ?? ''}
          onCancel={() =>
            setShowDeleteModal({ ...showDeleteModal, [key]: false })
          }
          onConfirm={() => {
            switch (key) {
              case 'completed':
                clearCompleted()
                break
              case 'expired':
                clearExpired()
                break
              case 'all':
                clearAll()
                break
            }
            setShowDeleteModal({ ...showDeleteModal, [key]: false })
          }}
        />
      ))}
    </>
  )
}

export default DangerZone
