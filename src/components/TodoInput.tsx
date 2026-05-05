import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { HiMiniPlus } from 'react-icons/hi2'

import { dictAtom, todoListAtom } from '@/atoms'
import { ConfirmModal, TaskFormModal, TaskFormValues } from '@/components'
import { Button } from '@/components/UI'
import { Todo } from '@/types'
import { addTodoStorage, generateUniqueId } from '@/utils'

function TodoInput() {
  const [todos, setTodos] = useAtom(todoListAtom)
  const dict = useAtomValue(dictAtom)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [showAdd, setShowAdd] = React.useState(false)
  const [showError, setShowError] = React.useState(false)
  const [pendingValues, setPendingValues] =
    React.useState<TaskFormValues | null>(null)

  const handleSubmit = (values: TaskFormValues) => {
    if (!values.title.trim()) {
      setShowError(true)
      return
    }
    setPendingValues(values)
    setShowAdd(true)
  }

  const addTodo = () => {
    if (!pendingValues) return
    const newTodo: Todo = {
      id: generateUniqueId(),
      title: pendingValues.title,
      description: pendingValues.description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      completedAt: null,
      dueDate: pendingValues.dueDate,
      notify: false,
      priority: pendingValues.priority,
      status: 'todo',
      subtasks: pendingValues.subtasks,
    }
    setTodos(addTodoStorage(newTodo, todos))
    setPendingValues(null)
    setShowAdd(false)
    setIsFormOpen(false)
  }

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 z-40 gap-2 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        size="lg"
        variant="primary"
        onPress={() => setIsFormOpen(true)}
      >
        <HiMiniPlus className="h-5 w-5" />
        <span className="hidden text-sm font-semibold sm:inline">
          {dict.todolist.addTask.title}
        </span>
      </Button>

      <TaskFormModal
        cancelLabel={dict.todolist.addTask.cancel}
        headerLabel={dict.todolist.addTask.title}
        isOpen={isFormOpen}
        submitLabel={dict.todolist.addTask.submit}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {showAdd && (
        <ConfirmModal
          buttonCancel={dict.todolist.addTask.cancel}
          buttonConfirm={dict.todolist.addTask.submit}
          description={dict.todolist.addTask.confirm}
          isOpen={showAdd}
          title={dict.todolist.addTask.title}
          onCancel={() => setShowAdd(false)}
          onConfirm={addTodo}
        />
      )}
      {showError && (
        <ConfirmModal
          buttonConfirm="OK"
          description={dict.todolist.addTask.error}
          isOpen={showError}
          title={dict.todolist.addTask.title}
          onCancel={() => setShowError(false)}
        />
      )}
    </>
  )
}

export default TodoInput
