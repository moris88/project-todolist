import React from 'react'

import { ConfirmModal } from '@/components'
import { Button, ButtonGroup, Switch } from '@/components/UI'
import { Todo } from '@/types'
import {
  clearTodosCompleted,
  clearTodosExpired,
  dict,
  exportToCSV,
  parseCSV,
  removeAllTodos,
  updateTodoStorage,
} from '@/utils'

interface DangerZoneProps {
  todos: Todo[]
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}

function DangerZone({ todos, setTodos }: DangerZoneProps) {
  const [showDangerZone, setShowDangerZone] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [showDeleteModal, setShowDeleteModal] = React.useState<{
    completed: boolean
    expired: boolean
    all: boolean
  }>({
    completed: false,
    expired: false,
    all: false,
  })

  const handleDelete = (key: keyof typeof showDeleteModal) => {
    setShowDeleteModal({ ...showDeleteModal, [key]: true })
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const importedTodos = parseCSV(text)
        if (importedTodos.length > 0) {
          // Merge imported todos with existing ones, avoiding duplicates by ID
          const existingIds = new Set(todos.map((t) => t.id))
          const newTodosToAdd = importedTodos.filter(
            (t) => !existingIds.has(t.id)
          )

          const finalTodos = [...todos, ...newTodosToAdd]
          setTodos(updateTodoStorage(finalTodos))

          // Save to individual items in storage too (updateTodoStorage handles this)
          // But we need to update the list of IDs
          localStorage.setItem(
            'todos',
            JSON.stringify(finalTodos.map((t) => t.id))
          )

          alert(dict.todolist.listitem.filter.csv.success)
        }
      } catch (error) {
        alert(
          dict.todolist.listitem.filter.csv.error +
            (error instanceof Error ? `: ${error.message}` : '')
        )
      }
    }
    reader.readAsText(file)
    // Reset input
    event.target.value = ''
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
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-wrap gap-2">
            <Button
              color="primary"
              size="sm"
              onPress={() => exportToCSV(todos)}
            >
              {dict.todolist.listitem.filter.csv.export}
            </Button>
            <Button
              color="secondary"
              size="sm"
              onPress={() => fileInputRef.current?.click()}
            >
              {dict.todolist.listitem.filter.csv.import}
            </Button>
            <input
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              type="file"
              onChange={handleImportCSV}
            />
          </div>
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
                setTodos(clearTodosCompleted(todos))
                break
              case 'expired':
                setTodos(clearTodosExpired(todos))
                break
              case 'all':
                setTodos(removeAllTodos())
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
