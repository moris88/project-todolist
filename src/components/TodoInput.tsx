import {
  Button,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from '@heroui/react'
import { getLocalTimeZone, today, ZonedDateTime } from '@internationalized/date'
import { useAtom } from 'jotai'
import React from 'react'
import { HiFlag, HiMiniPlus, HiOutlineFlag } from 'react-icons/hi2'

import { todoListAtom } from '@/atoms'
import { ConfirmModal } from '@/components'
import { Priority, Todo } from '@/types'
import { addTodoStorage, dict, generateUniqueId, priorityItems } from '@/utils'

function TodoInput() {
  const [title, setTitle] = React.useState<string>('')
  const [description, setDescription] = React.useState<string>('')
  const [priority, setPriority] = React.useState<Priority>('medium')
  const [todos, setTodos] = useAtom(todoListAtom)
  const [dueDate, setDueDate] = React.useState<ZonedDateTime | null>(null)
  const [showInput, setShowInput] = React.useState(true)
  const [showAdd, setShowAdd] = React.useState(false)
  const [showError, setShowError] = React.useState(false)
  const [showDescription, setShowDescription] = React.useState(false)
  const [required, setRequired] = React.useState(false)

  const minValue = today(getLocalTimeZone()) as any

  const addTodo = () => {
    const newTodo: Todo = {
      id: generateUniqueId(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      completedAt: null,
      dueDate: dueDate ? dueDate.toDate().toISOString() : null,
      notify: false,
      priority,
      category: 'todo',
    }
    setTodos(addTodoStorage(newTodo, todos))
    setTitle('')
    setDueDate(null)
    setRequired(false)
    setShowAdd(false)
  }

  const confirmAddTodo = () => {
    if (!required && title.trim() === '') {
      setShowError(true)
      return
    }
    setShowAdd(true)
  }

  const handleSetDueDate = (date: any) => {
    setDueDate(date)
  }

  const handlePriorityChange = (value: string) => {
    const mappaPriority: Record<string, string> = {
      '0': 'urgent',
      '1': 'high',
      '2': 'medium',
      '3': 'low',
    }
    setPriority(mappaPriority[value] as Priority)
  }

  return (
    <div className="flex w-full flex-col items-center gap-y-4" id="todo-input">
      <Switch
        checked={showInput}
        className="flex items-center lg:hidden"
        size="sm"
        onChange={(e) => setShowInput(!e.target.checked)}
      >
        {dict.todolist.addTask.hiddenForm}
      </Switch>
      {showInput && (
        <>
          <div className="flex w-full flex-col items-center gap-4 lg:flex-row">
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
              value={dueDate as any}
              onChange={handleSetDueDate}
            />
            <Select
              defaultSelectedKeys={priorityItems.indexOf(priority).toString()}
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
            <Switch
              size="sm"
              onChange={(e) => setShowDescription(e.target.checked)}
            >
              {dict.todolist.addTask.label}
            </Switch>
            <Button
              className="flex min-w-12 gap-1 md:min-w-36"
              color="success"
              size="lg"
              onPress={confirmAddTodo}
            >
              <HiMiniPlus className="h-6 w-6" />
              <span className="hidden md:inline">
                {dict.todolist.addTask.submit}
              </span>
            </Button>
          </div>
          {showDescription && (
            <Textarea
              className="w-full"
              label={dict.todolist.addTask.description}
              maxRows={10}
              minRows={5}
              size="sm"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
              }}
            />
          )}
        </>
      )}
      {showAdd && (
        <ConfirmModal
          buttonCancel={dict.todolist.addTask.cancel}
          buttonConfirm={dict.todolist.addTask.submit}
          colorConfirm="primary"
          description={dict.todolist.addTask.confirm}
          isOpen={showAdd}
          title={dict.todolist.addTask.title}
          onCancel={() => setShowAdd(false)}
          onConfirm={addTodo}
        />
      )}
      {showError && (
        <ConfirmModal
          buttonConfirm={dict.todolist.addTask.submit}
          description={dict.todolist.addTask.error}
          isOpen={showError}
          title={dict.todolist.addTask.title}
          onCancel={() => setShowError(false)}
        />
      )}
    </div>
  )
}

export default TodoInput
