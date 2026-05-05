import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { HiMiniPlus } from 'react-icons/hi2'

import { dictAtom, todoListAtom } from '@/atoms'
import { ConfirmModal } from '@/components'
import {
  Button,
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
import { Priority, Todo } from '@/types'
import { addTodoStorage, generateUniqueId, priorityItems } from '@/utils'

function TodoInput() {
  const [title, setTitle] = React.useState<string>('')
  const [description, setDescription] = React.useState<string>('')
  const [priority, setPriority] = React.useState<Priority>('medium')
  const [todos, setTodos] = useAtom(todoListAtom)
  const dict = useAtomValue(dictAtom)
  const [dueDate, setDueDate] = React.useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [showAdd, setShowAdd] = React.useState(false)
  const [showError, setShowError] = React.useState(false)
  const [required, setRequired] = React.useState(false)

  const minValue = new Date().toISOString().slice(0, 16)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDueDate(null)
    setPriority('medium')
    setRequired(false)
  }

  const addTodo = () => {
    const newTodo: Todo = {
      id: generateUniqueId(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      completedAt: null,
      dueDate: dueDate,
      notify: false,
      priority,
      category: 'todo',
    }
    setTodos(addTodoStorage(newTodo, todos))
    resetForm()
    setShowAdd(false)
    setIsFormOpen(false)
  }

  const confirmAddTodo = () => {
    if (!required || title.trim() === '') {
      setShowError(true)
      return
    }
    setShowAdd(true)
  }

  const handlePriorityChange = (value: string) => {
    const map: Record<string, Priority> = {
      '0': 'urgent',
      '1': 'high',
      '2': 'medium',
      '3': 'low',
    }
    setPriority(map[value])
  }

  const handleClose = () => {
    resetForm()
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
        <span className="hidden text-sm font-semibold sm:inline">{dict.todolist.addTask.title}</span>
      </Button>

      <Modal isDismissable isOpen={isFormOpen} onClose={handleClose}>
        <ModalContent>
          <ModalHeader>{dict.todolist.addTask.title}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                className="w-full"
                label={dict.todolist.addTask.name}
                placeholder={dict.todolist.addTask.placeholder}
                value={title}
                onChange={(e) => {
                  setRequired(true)
                  setTitle(e.target.value)
                }}
              />
              <DatePicker
                showMonthAndYearPickers
                className="w-full"
                granularity="minute"
                label={dict.todolist.addTask.due_date}
                minValue={minValue}
                value={dueDate}
                onChange={(iso) => setDueDate(iso)}
              />
              <Select
                defaultSelectedKeys={priorityItems.indexOf(priority).toString()}
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
              <Textarea
                className="w-full"
                label={dict.todolist.addTask.description}
                maxRows={8}
                minRows={4}
                size="sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={handleClose}>
              {dict.todolist.addTask.cancel}
            </Button>
            <Button variant="primary" onPress={confirmAddTodo}>
              {dict.todolist.addTask.submit}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
