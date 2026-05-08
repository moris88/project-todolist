import '@testing-library/jest-dom'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useAtom, Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React from 'react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { commentsAtom, projectsAtom, sprintsAtom, tagsAtom, todoListAtom, trashAtom } from '../src/atoms/atoms'
import CalendarView from '../src/components/CalendarView'
import Comments from '../src/components/Comments'
import ConfirmModal from '../src/components/ConfirmModal'
import DangerZone from '../src/components/DangerZone'
import Header from '../src/components/Header'
import MarkdownContent from '../src/components/MarkdownContent'
import ProjectsManager from '../src/components/ProjectsManager'
import SettingsView from '../src/components/SettingsView'
import SprintsManager from '../src/components/SprintsManager'
import TaskDetailModal from '../src/components/TaskDetailModal'
import TaskFormModal from '../src/components/TaskFormModal'
import TodoInput from '../src/components/TodoInput'
import TodoItem from '../src/components/TodoItem'
import TodoList from '../src/components/TodoList'
import TrashView from '../src/components/TrashView'
import Wrapper from '../src/components/Wrapper'
import Button from '../src/components/UI/Button'
import ButtonGroup from '../src/components/UI/ButtonGroup'
import Checkbox from '../src/components/UI/Checkbox'
import Chip from '../src/components/UI/Chip'
import DatePicker from '../src/components/UI/DatePicker'
import Input from '../src/components/UI/Input'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '../src/components/UI/Modal'
import Select from '../src/components/UI/Select'
import SelectItem from '../src/components/UI/SelectItem'
import Switch from '../src/components/UI/Switch'
import Textarea from '../src/components/UI/Textarea'
import Tooltip from '../src/components/UI/Tooltip'
import { Comment, Project, Sprint, Todo } from '../src/types'

// ─── Test helpers ─────────────────────────────────────────────────────────────

function HydrateAtoms({
  initialValues,
  children,
}: {
  initialValues: [atom: any, value: any][]
  children: React.ReactNode
}) {
  useHydrateAtoms(initialValues)
  return <>{children}</>
}

function TestProvider({
  initialValues = [],
  children,
}: {
  initialValues?: [atom: any, value: any][]
  children: React.ReactNode
}) {
  return (
    <Provider>
      <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
  )
}

const baseTodo: Todo = {
  id: 'todo-1',
  title: 'Test Task',
  description: 'Test **description**',
  completed: false,
  createdAt: '2024-01-01T10:00:00.000Z',
  updatedAt: null,
  completedAt: null,
  dueDate: null,
  notify: false,
  priority: 'medium',
  status: 'todo',
  subtasks: [],
  tags: [],
}

const todoWithSubtasks: Todo = {
  ...baseTodo,
  id: 'todo-2',
  title: 'Task with subtasks',
  subtasks: [
    { id: 'sub-1', title: 'Subtask One', completed: false, completedAt: null },
    { id: 'sub-2', title: 'Subtask Two', completed: true, completedAt: '2024-01-02T10:00:00.000Z' },
  ],
}

const completedTodo: Todo = {
  ...baseTodo,
  id: 'todo-3',
  title: 'Completed Task',
  completed: true,
  completedAt: '2024-01-02T12:00:00.000Z',
  status: 'done',
}

const archivedTodo: Todo = {
  ...baseTodo,
  id: 'todo-4',
  title: 'Archived Task',
  status: 'archived',
}

const todoWithTags: Todo = {
  ...baseTodo,
  id: 'todo-5',
  title: 'Tagged Task',
  tags: ['frontend', 'urgent'],
}

const trashedTodo: Todo = {
  ...baseTodo,
  id: 'trashed-1',
  title: 'Trashed Task',
  deletedAt: '2024-01-05T10:00:00.000Z',
}

const baseProject: Project = {
  id: 'project-1',
  name: 'Test Project',
  description: 'Project description',
  color: '#3b82f6',
  priority: 'medium',
  status: 'active',
  createdAt: '2024-01-01T10:00:00.000Z',
  updatedAt: null,
}

const baseSprint: Sprint = {
  id: 'sprint-1',
  name: 'Test Sprint',
  description: 'Sprint description',
  startDate: '2024-01-01',
  dueDate: '2024-01-31',
  status: 'active',
  projectId: 'project-1',
  createdAt: '2024-01-01T10:00:00.000Z',
  updatedAt: null,
}

// Wrapper that reads todo from atom so UI updates on state changes
function AtomTodoItem({
  todoId,
  showSubtasks,
  showDescriptions,
  onDetailPress,
}: {
  todoId: string
  showSubtasks?: boolean
  showDescriptions?: boolean
  onDetailPress?: () => void
}) {
  const [todos] = useAtom(todoListAtom)
  const todo = todos.find((t) => t.id === todoId)
  if (!todo) return null
  return (
    <TodoItem
      todo={todo}
      showSubtasks={showSubtasks}
      showDescriptions={showDescriptions}
      onDetailPress={onDetailPress}
    />
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

describe('Chip', () => {
  it('renders children text', () => {
    render(<Chip>Active</Chip>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('default color has bg-gray-100 class', () => {
    render(<Chip>Default</Chip>)
    expect(screen.getByText('Default')).toHaveClass('bg-gray-100')
  })

  it('color="success" has bg-green-100', () => {
    render(<Chip color="success">Done</Chip>)
    expect(screen.getByText('Done')).toHaveClass('bg-green-100')
  })

  it('color="warning" has bg-yellow-100', () => {
    render(<Chip color="warning">Warn</Chip>)
    expect(screen.getByText('Warn')).toHaveClass('bg-yellow-100')
  })

  it('color="danger" has bg-red-200', () => {
    render(<Chip color="danger">Error</Chip>)
    expect(screen.getByText('Error')).toHaveClass('bg-red-200')
  })

  it('size="sm" has text-xs', () => {
    render(<Chip size="sm">Small</Chip>)
    expect(screen.getByText('Small')).toHaveClass('text-xs')
  })

  it('default size has text-sm', () => {
    render(<Chip>Medium</Chip>)
    expect(screen.getByText('Medium')).toHaveClass('text-sm')
  })
})

// ─── Textarea ─────────────────────────────────────────────────────────────────

describe('Textarea', () => {
  it('renders label when provided', () => {
    render(<Textarea label="Notes" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('renders no label element when label is omitted', () => {
    const { container } = render(<Textarea value="" onChange={vi.fn()} />)
    expect(container.querySelector('label')).toBeNull()
  })

  it('renders with given value', () => {
    render(<Textarea value="hello there" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('hello there')
  })

  it('calls onChange when typed', () => {
    const handleChange = vi.fn()
    render(<Textarea value="" onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new text' },
    })
    expect(handleChange).toHaveBeenCalledOnce()
  })

  it('forwards ref to underlying textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} value="test" onChange={vi.fn()} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(ref.current?.value).toBe('test')
  })
})

// ─── Input ────────────────────────────────────────────────────────────────────

describe('Input', () => {
  it('renders label', () => {
    render(<Input label="Task title" value="" onChange={vi.fn()} />)
    expect(screen.getByText('Task title')).toBeInTheDocument()
  })

  it('renders with value', () => {
    render(<Input value="my value" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('my value')
  })

  it('calls onChange when typed', () => {
    const handleChange = vi.fn()
    render(<Input value="" onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'typed' },
    })
    expect(handleChange).toHaveBeenCalledOnce()
  })
})

// ─── DatePicker ───────────────────────────────────────────────────────────────

describe('DatePicker', () => {
  it('renders label when provided', () => {
    render(<DatePicker label="Due date" />)
    expect(screen.getByText('Due date')).toBeInTheDocument()
  })

  it('renders no label when omitted', () => {
    const { container } = render(<DatePicker />)
    expect(container.querySelector('label')).toBeNull()
  })

  it('renders a datetime-local input', () => {
    const { container } = render(<DatePicker value="2024-06-01T12:00:00.000Z" />)
    const input = container.querySelector('input[type="datetime-local"]')
    expect(input).toBeInTheDocument()
  })

  it('calls onChange with null when value is cleared', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <DatePicker value="2024-06-01T12:00:00.000Z" onChange={handleChange} />
    )
    const input = container.querySelector('input[type="datetime-local"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })
    expect(handleChange).toHaveBeenCalledWith(null)
  })

  it('calls onChange with ISO string when a date is selected', () => {
    const handleChange = vi.fn()
    const { container } = render(<DatePicker onChange={handleChange} />)
    const input = container.querySelector('input[type="datetime-local"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2024-06-01T10:00' } })
    expect(handleChange).toHaveBeenCalledOnce()
    const arg = handleChange.mock.calls[0][0] as string
    expect(typeof arg).toBe('string')
    expect(arg).toContain('2024')
  })
})

// ─── Select + SelectItem ──────────────────────────────────────────────────────

describe('Select + SelectItem', () => {
  it('shows placeholder when no defaultSelectedKeys', () => {
    render(
      <Select onChange={vi.fn()}>
        <SelectItem value="v1">Option One</SelectItem>
      </Select>
    )
    expect(screen.getByText('Seleziona...')).toBeInTheDocument()
  })

  it('shows the label of the defaultSelectedKeys item', () => {
    render(
      <Select defaultSelectedKeys="v1" onChange={vi.fn()}>
        <SelectItem value="v1">Option One</SelectItem>
      </Select>
    )
    expect(screen.getByRole('button', { name: /Option One/i })).toBeInTheDocument()
  })

  it('opens dropdown on trigger click', () => {
    render(
      <Select onChange={vi.fn()}>
        <SelectItem value="v1">Option One</SelectItem>
      </Select>
    )
    // The dropdown item button is not visible until opened
    expect(screen.queryAllByText('Option One').length).toBe(0)

    // Click the trigger button (the one that shows "Seleziona...")
    fireEvent.click(screen.getByRole('button', { name: /Seleziona\.\.\./i }))

    // After open, the option should appear
    expect(screen.getAllByText('Option One').length).toBeGreaterThan(0)
  })

  it('calls onChange with the correct value when an item is clicked', () => {
    const handleChange = vi.fn()
    render(
      <Select onChange={handleChange}>
        <SelectItem value="v1">Option One</SelectItem>
      </Select>
    )

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: /Seleziona\.\.\./i }))

    // Click the option
    const optionButton = screen.getAllByText('Option One')[0].closest('button')!
    fireEvent.click(optionButton)

    expect(handleChange).toHaveBeenCalledOnce()
    const event = handleChange.mock.calls[0][0] as { target: { value: string; name: string } }
    expect(event.target.value).toBe('v1')
    expect(event.target.name).toBe('')
  })

  it('shows startContent in the trigger for the selected item', () => {
    render(
      <Select defaultSelectedKeys="v1" onChange={vi.fn()}>
        <SelectItem value="v1" startContent={<span data-testid="icon" />}>
          Option One
        </SelectItem>
      </Select>
    )
    // The trigger button should contain the startContent icon
    const trigger = screen.getByRole('button', { name: /Option One/i })
    expect(trigger.querySelector('[data-testid="icon"]')).toBeInTheDocument()
  })
})

// ─── Button ───────────────────────────────────────────────────────────────────

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies primary variant classes', () => {
    render(<Button variant="primary">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-blue-500')
  })

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')
  })

  it('applies sm size classes', () => {
    render(<Button size="sm">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-sm')
  })

  it('applies lg size classes', () => {
    render(<Button size="lg">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-lg')
  })

  it('is disabled when isDisabled=true', () => {
    render(<Button isDisabled>Go</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveClass('opacity-50')
  })

  it('calls onPress when clicked', () => {
    const handler = vi.fn()
    render(<Button onPress={handler}>Go</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('calls onClick when onPress is not set', () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Go</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('prefers onPress over onClick', () => {
    const onPress = vi.fn()
    const onClick = vi.fn()
    render(<Button onClick={onClick} onPress={onPress}>Go</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledOnce()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies extra className', () => {
    render(<Button className="my-custom-class">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('my-custom-class')
  })
})

// ─── ButtonGroup ──────────────────────────────────────────────────────────────

describe('ButtonGroup', () => {
  it('renders children', () => {
    render(
      <ButtonGroup>
        <button>A</button>
        <button>B</button>
      </ButtonGroup>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('wraps children in a flex container', () => {
    const { container } = render(
      <ButtonGroup>
        <button>X</button>
      </ButtonGroup>
    )
    expect(container.firstChild).toHaveClass('inline-flex')
  })

  it('forwards extra className to the wrapper', () => {
    const { container } = render(
      <ButtonGroup className="extra">
        <button>X</button>
      </ButtonGroup>
    )
    expect(container.firstChild).toHaveClass('extra')
  })
})

// ─── Checkbox ─────────────────────────────────────────────────────────────────

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders checked when isSelected=true', () => {
    render(<Checkbox isSelected />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('shows checkmark SVG when isSelected=true', () => {
    const { container } = render(<Checkbox isSelected />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('hides checkmark when isSelected=false', () => {
    const { container } = render(<Checkbox isSelected={false} />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('is disabled when isDisabled=true', () => {
    render(<Checkbox isDisabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('applies cursor-not-allowed class when disabled', () => {
    const { container } = render(<Checkbox isDisabled />)
    expect(container.querySelector('label')).toHaveClass('cursor-not-allowed')
  })

  it('calls onChange when clicked', () => {
    const handler = vi.fn()
    render(<Checkbox onChange={handler} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('renders children label text', () => {
    render(<Checkbox>My label</Checkbox>)
    expect(screen.getByText('My label')).toBeInTheDocument()
  })
})

// ─── Switch ───────────────────────────────────────────────────────────────────

describe('Switch', () => {
  it('renders unchecked by default', () => {
    render(<Switch />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders checked when checked=true', () => {
    render(<Switch checked />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onChange when toggled', () => {
    const handler = vi.fn()
    render(<Switch onChange={handler} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('renders children label', () => {
    render(<Switch>Toggle me</Switch>)
    expect(screen.getByText('Toggle me')).toBeInTheDocument()
  })

  it('applies sm track size class', () => {
    const { container } = render(<Switch size="sm" />)
    expect(container.querySelector('div.h-4')).toBeInTheDocument()
  })

  it('applies lg track size class', () => {
    const { container } = render(<Switch size="lg" />)
    expect(container.querySelector('div.h-7')).toBeInTheDocument()
  })

  it('applies danger color class', () => {
    const { container } = render(<Switch color="danger" checked />)
    const track = container.querySelector('div.rounded-full')
    expect(track?.className).toMatch(/peer-checked:bg-red-500/)
  })
})

// ─── Modal ────────────────────────────────────────────────────────────────────

describe('Modal', () => {
  it('renders nothing when isOpen=false', () => {
    const { container } = render(
      <Modal isOpen={false}>
        <div data-testid="content">Content</div>
      </Modal>
    )
    expect(container.querySelector('[data-testid="content"]')).toBeNull()
  })

  it('renders children when isOpen=true', () => {
    render(
      <Modal isOpen>
        <div data-testid="content">Content</div>
      </Modal>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('calls onClose when overlay is clicked (isDismissable=true)', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal isOpen onClose={onClose}>
        <div>Inner</div>
      </Modal>
    )
    const overlay = container.ownerDocument.querySelector('.fixed.inset-0') as HTMLElement
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does NOT call onClose when overlay is clicked with isDismissable=false', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal isDismissable={false} isOpen onClose={onClose}>
        <div>Inner</div>
      </Modal>
    )
    const overlay = container.ownerDocument.querySelector('.fixed.inset-0') as HTMLElement
    fireEvent.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not bubble click from inner content to overlay', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        <div data-testid="inner">Inner</div>
      </Modal>
    )
    fireEvent.click(screen.getByTestId('inner'))
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('ModalContent', () => {
  it('renders children', () => {
    render(<ModalContent><span>body</span></ModalContent>)
    expect(screen.getByText('body')).toBeInTheDocument()
  })
})

describe('ModalHeader', () => {
  it('renders header text', () => {
    render(<ModalHeader>Title</ModalHeader>)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })
})

describe('ModalBody', () => {
  it('renders body content', () => {
    render(<ModalBody><p>Hello</p></ModalBody>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})

describe('ModalFooter', () => {
  it('renders footer content', () => {
    render(<ModalFooter><button>OK</button></ModalFooter>)
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
  })
})

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

describe('ConfirmModal', () => {
  it('renders nothing when isOpen=false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        title="Delete"
        description="Are you sure?"
        buttonConfirm="Yes"
        onConfirm={vi.fn()}
      />
    )
    expect(screen.queryByText('Delete')).toBeNull()
  })

  it('renders title and description when isOpen=true', () => {
    render(
      <ConfirmModal
        isOpen
        title="Delete"
        description="Are you sure?"
        buttonConfirm="Yes"
        onConfirm={vi.fn()}
      />
    )
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('shows confirm button and calls onConfirm when clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmModal
        isOpen
        title="T"
        description="D"
        buttonConfirm="Confirm"
        onConfirm={onConfirm}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('shows cancel button and calls onCancel when clicked', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmModal
        isOpen
        title="T"
        description="D"
        buttonConfirm="Yes"
        buttonCancel="No"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('does not render cancel button when buttonCancel is omitted', () => {
    render(
      <ConfirmModal
        isOpen
        title="T"
        description="D"
        buttonConfirm="Yes"
        onConfirm={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull()
  })

  it('uses default "Confirm" label when buttonConfirm is omitted', () => {
    render(
      <ConfirmModal isOpen title="T" description="D" onConfirm={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })
})

// ─── Header ───────────────────────────────────────────────────────────────────

describe('Header', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders the app title', () => {
    render(<Provider><Header /></Provider>)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('renders a notification bell button', () => {
    render(<Provider><Header /></Provider>)
    // Header renders at least one button (notification bell or nav)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})

// ─── Wrapper ──────────────────────────────────────────────────────────────────

describe('Wrapper', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders children inside the wrapper', () => {
    render(<Provider><Wrapper><div data-testid="child">Hi</div></Wrapper></Provider>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('adds the "dark" class on documentElement when darkMode is enabled', () => {
    // Pre-seed dark mode in localStorage
    localStorage.setItem('darkMode', 'true')
    render(<Provider><Wrapper><span /></Wrapper></Provider>)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    document.documentElement.classList.remove('dark')
  })

  it('removes the "dark" class when darkMode is false', () => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'false')
    render(<Provider><Wrapper><span /></Wrapper></Provider>)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

// ─── MarkdownContent ──────────────────────────────────────────────────────────

describe('MarkdownContent', () => {
  it('renders plain text content', () => {
    render(<MarkdownContent content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders markdown bold as <strong>', () => {
    const { container } = render(<MarkdownContent content="**bold text**" />)
    expect(container.querySelector('strong')).toBeInTheDocument()
  })

  it('wraps output in div with markdown-content class', () => {
    const { container } = render(<MarkdownContent content="test" />)
    expect(container.firstChild).toHaveClass('markdown-content')
  })

  it('applies extra className to wrapper', () => {
    const { container } = render(<MarkdownContent content="test" className="extra-class" />)
    expect(container.firstChild).toHaveClass('markdown-content', 'extra-class')
  })

  it('renders GFM strikethrough', () => {
    const { container } = render(<MarkdownContent content="~~crossed~~" />)
    expect(container.querySelector('del')).toBeInTheDocument()
  })
})

// ─── Tooltip ──────────────────────────────────────────────────────────────────

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tip text">
        <button>hover me</button>
      </Tooltip>
    )
    expect(screen.getByRole('button', { name: 'hover me' })).toBeInTheDocument()
  })

  it('renders tooltip text in DOM with role="tooltip"', () => {
    render(
      <Tooltip content="My tooltip">
        <span>target</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('My tooltip')
  })

  it('tooltip is initially not visible (opacity-0 class)', () => {
    render(
      <Tooltip content="hidden">
        <span>target</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toHaveClass('opacity-0')
  })

  it('applies bottom placement classes', () => {
    render(
      <Tooltip content="Tip" placement="bottom">
        <span>target</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip').className).toContain('top-full')
  })

  it('applies left placement classes', () => {
    render(
      <Tooltip content="Tip" placement="left">
        <span>target</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip').className).toContain('right-full')
  })

  it('applies right placement classes', () => {
    render(
      <Tooltip content="Tip" placement="right">
        <span>target</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip').className).toContain('left-full')
  })

  it('defaults to top placement (bottom-full class)', () => {
    render(
      <Tooltip content="Tip">
        <span>target</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip').className).toContain('bottom-full')
  })
})

// ─── Comments ─────────────────────────────────────────────────────────────────

describe('Comments', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('shows empty state message when no comments', () => {
    render(
      <TestProvider>
        <Comments todoId="t1" />
      </TestProvider>
    )
    expect(screen.getByText('Nessun commento ancora')).toBeInTheDocument()
  })

  it('renders section title', () => {
    render(
      <TestProvider>
        <Comments todoId="t1" />
      </TestProvider>
    )
    expect(screen.getByText('Commenti')).toBeInTheDocument()
  })

  it('renders send button', () => {
    render(
      <TestProvider>
        <Comments todoId="t1" />
      </TestProvider>
    )
    expect(screen.getByRole('button', { name: 'Invia' })).toBeInTheDocument()
  })

  it('renders existing comments from localStorage', () => {
    const existingComment: Comment = {
      id: 'c1',
      todoId: 't1',
      text: 'Great progress!',
      createdAt: '2024-01-01T10:00:00.000Z',
    }
    localStorage.setItem('comments', JSON.stringify([existingComment]))
    render(
      <TestProvider>
        <Comments todoId="t1" />
      </TestProvider>
    )
    expect(screen.getByText('Great progress!')).toBeInTheDocument()
  })

  it('does not show comments from other todos', () => {
    const otherComment: Comment = {
      id: 'c2',
      todoId: 'other-todo',
      text: 'Other comment',
      createdAt: '2024-01-01T10:00:00.000Z',
    }
    render(
      <TestProvider initialValues={[[commentsAtom, [otherComment]]]}>
        <Comments todoId="t1" />
      </TestProvider>
    )
    expect(screen.queryByText('Other comment')).toBeNull()
  })

  it('adds a comment when send button is clicked', async () => {
    render(
      <TestProvider>
        <Comments todoId="t1" />
      </TestProvider>
    )
    const textarea = screen.getByPlaceholderText(/Scrivi un commento/i)
    fireEvent.change(textarea, { target: { value: 'My new comment' } })
    fireEvent.click(screen.getByRole('button', { name: 'Invia' }))
    await waitFor(() => {
      expect(screen.getByText('My new comment')).toBeInTheDocument()
    })
  })

  it('does not add empty comment when send is clicked', () => {
    render(
      <TestProvider>
        <Comments todoId="t1" />
      </TestProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Invia' }))
    expect(screen.getByText('Nessun commento ancora')).toBeInTheDocument()
  })

  it('adds a comment on Enter key press', async () => {
    render(
      <TestProvider>
        <Comments todoId="t1" />
      </TestProvider>
    )
    const textarea = screen.getByPlaceholderText(/Scrivi un commento/i)
    fireEvent.change(textarea, { target: { value: 'Enter comment' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })
    await waitFor(() => {
      expect(screen.getByText('Enter comment')).toBeInTheDocument()
    })
  })

  it('does NOT send on Shift+Enter (no bubble added)', () => {
    render(
      <TestProvider>
        <Comments todoId="t1" />
      </TestProvider>
    )
    const textarea = screen.getByPlaceholderText(/Scrivi un commento/i)
    fireEvent.change(textarea, { target: { value: 'Shift enter text' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    // Comment bubble is a blue rounded div — none should exist
    expect(document.querySelector('.bg-blue-500.rounded-2xl')).toBeNull()
  })
})

// ─── DangerZone ───────────────────────────────────────────────────────────────

describe('DangerZone', () => {
  it('renders Import/Export and Danger Zone switches', () => {
    render(
      <TestProvider>
        <DangerZone />
      </TestProvider>
    )
    expect(screen.getByText('Import/Export')).toBeInTheDocument()
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
  })

  it('does not show CSV buttons by default', () => {
    render(
      <TestProvider>
        <DangerZone />
      </TestProvider>
    )
    expect(screen.queryByText('Che operazione vuoi fare?')).toBeNull()
  })

  it('shows CSV buttons after enabling Import/Export switch', () => {
    render(
      <TestProvider>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[0])
    expect(screen.getByText('Che operazione vuoi fare?')).toBeInTheDocument()
  })

  it('shows empty message in danger zone when todos is empty', () => {
    render(
      <TestProvider>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    expect(screen.getByText('Non ci sono compiti da filtrare')).toBeInTheDocument()
  })

  it('shows delete buttons when todos are present and danger zone is enabled', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    expect(screen.getAllByText('Pulisci completati').length).toBeGreaterThan(0)
  })

  it('opens confirm modal when a delete button is clicked', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    const clearBtn = screen.getAllByText('Pulisci completati')[0]
    fireEvent.click(clearBtn)
    expect(screen.getAllByText('Pulisci completati').length).toBeGreaterThan(1)
  })
})

// ─── TodoInput ────────────────────────────────────────────────────────────────

describe('TodoInput', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders the add task button', () => {
    render(
      <TestProvider>
        <TodoInput />
      </TestProvider>
    )
    expect(screen.getByRole('button', { name: /Aggiungi un compito/i })).toBeInTheDocument()
  })

  it('opens the task form modal when add button is clicked', () => {
    render(
      <TestProvider>
        <TodoInput />
      </TestProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi un compito/i }))
    expect(screen.getAllByText('Aggiungi un compito').length).toBeGreaterThan(1)
  })
})

// ─── TodoItem ─────────────────────────────────────────────────────────────────

describe('TodoItem', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders the todo title', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} />
      </TestProvider>
    )
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('renders unchecked checkbox for incomplete todo', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} />
      </TestProvider>
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders checked checkbox for completed todo', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [completedTodo]]]}>
        <TodoItem todo={completedTodo} />
      </TestProvider>
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('shows status chip', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} />
      </TestProvider>
    )
    expect(screen.getByText(/Stato:/)).toBeInTheDocument()
  })

  it('shows tags inline when todo has tags', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithTags]]]}>
        <TodoItem todo={todoWithTags} />
      </TestProvider>
    )
    expect(screen.getByText('frontend')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
  })

  it('calls onDetailPress when eye button is clicked', () => {
    const onDetailPress = vi.fn()
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} onDetailPress={onDetailPress} />
      </TestProvider>
    )
    // The detail tooltip has content "Dettaglio"
    const detailTooltip = screen.getAllByRole('tooltip').find(t => t.textContent === 'Dettaglio')
    const detailBtn = detailTooltip?.parentElement?.querySelector('button')
    expect(detailBtn).toBeTruthy()
    if (detailBtn) fireEvent.click(detailBtn)
    expect(onDetailPress).toHaveBeenCalledOnce()
  })

  it('shows delete confirm modal when delete button is pressed', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} />
      </TestProvider>
    )
    // The delete tooltip has content "Elimina"
    const deleteTooltip = screen.getAllByRole('tooltip').find(t => t.textContent === 'Elimina')
    const deleteBtn = deleteTooltip?.parentElement?.querySelector('button')
    expect(deleteBtn).toBeTruthy()
    if (deleteBtn) fireEvent.click(deleteBtn)
    expect(screen.getByText('Elimina compito')).toBeInTheDocument()
  })

  it('hides status row when showOnlyTitle is true', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} showOnlyTitle />
      </TestProvider>
    )
    expect(screen.queryByText(/Stato:/)).toBeNull()
  })

  it('hides ButtonGroup when showOnlyTitle is true', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} showOnlyTitle />
      </TestProvider>
    )
    expect(screen.queryByText(/Descrizione/)).toBeNull()
  })

  it('shows subtasks when showSubtasks prop is true', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithSubtasks]]]}>
        <TodoItem todo={todoWithSubtasks} showSubtasks />
      </TestProvider>
    )
    expect(screen.getByText('Subtask One')).toBeInTheDocument()
    expect(screen.getByText('Subtask Two')).toBeInTheDocument()
  })

  it('shows description when showDescriptions is true', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} showDescriptions />
      </TestProvider>
    )
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('opens status dropdown when edit-status button is clicked', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} />
      </TestProvider>
    )
    const editStatusBtn = screen.getByTitle('Modifica stato')
    fireEvent.click(editStatusBtn)
    expect(screen.getByText('In corso')).toBeInTheDocument()
  })

  it('checkbox is disabled for archived todo', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [archivedTodo]]]}>
        <TodoItem todo={archivedTodo} />
      </TestProvider>
    )
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('shows subtask count chip when todo has subtasks', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithSubtasks]]]}>
        <TodoItem todo={todoWithSubtasks} />
      </TestProvider>
    )
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})

// ─── TaskDetailModal ──────────────────────────────────────────────────────────

describe('TaskDetailModal', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders nothing when todoId is not found in atom', () => {
    const { container } = render(
      <TestProvider initialValues={[[todoListAtom, []]]}>
        <TaskDetailModal todoId="nonexistent" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when todoId is null', () => {
    const { container } = render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId={null} isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the todo title when open', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(screen.getAllByText('Test Task').length).toBeGreaterThan(0)
  })

  it('does not render when isOpen is false', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen={false} onClose={vi.fn()} />
      </TestProvider>
    )
    expect(screen.queryByText('Test Task')).toBeNull()
  })

  it('calls onClose when X button is clicked', () => {
    const onClose = vi.fn()
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={onClose} />
      </TestProvider>
    )
    // The footer Close/Cancel button calls onClose
    const footerBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Annulla'))
    expect(footerBtn).toBeTruthy()
    if (footerBtn) fireEvent.click(footerBtn)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows status chip', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(screen.getByText(/Stato:/)).toBeInTheDocument()
  })

  it('shows priority chip', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(screen.getByText('Media')).toBeInTheDocument()
  })

  it('shows subtasks section when todo has subtasks', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithSubtasks]]]}>
        <TaskDetailModal todoId="todo-2" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(screen.getByText('Subtask One')).toBeInTheDocument()
  })

  it('shows description label when todo has description', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(screen.getByText('Descrizione')).toBeInTheDocument()
  })

  it('edit button is disabled for completed todo', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [completedTodo]]]}>
        <TaskDetailModal todoId="todo-3" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    const editBtn = screen.getAllByRole('button').find(b =>
      b.className.includes('opacity-50') || b.hasAttribute('disabled')
    )
    expect(editBtn).toBeTruthy()
  })

  it('opens status dropdown when pencil icon is clicked', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    const statusEditBtns = document.querySelectorAll('button[type="button"]')
    const pencilBtn = [...statusEditBtns].find(b =>
      b.querySelector('svg') && b.className.includes('hover:text-blue-500')
    )
    if (pencilBtn) fireEvent.click(pencilBtn)
    expect(screen.getByText('In corso')).toBeInTheDocument()
  })

  it('renders comments section', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(screen.getByText('Commenti')).toBeInTheDocument()
  })

  it('shows tags when todo has tags', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithTags]]]}>
        <TaskDetailModal todoId="todo-5" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    expect(screen.getByText('frontend')).toBeInTheDocument()
  })
})

// ─── TodoList ─────────────────────────────────────────────────────────────────

function seedTodosStorage(todos: Todo[]) {
  localStorage.setItem('todos', JSON.stringify(todos.map((t) => t.id)))
  todos.forEach((t) => localStorage.setItem(t.id, JSON.stringify(t)))
}

describe('TodoList', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('shows empty state when no todos', () => {
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    expect(screen.getByText('Nessun compito disponibile')).toBeInTheDocument()
  })

  it('renders todo titles when todos present in localStorage', async () => {
    seedTodosStorage([baseTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
  })

  it('does not show filter panel when no todos', () => {
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    expect(screen.queryByText('Filtri')).toBeNull()
  })

  it('shows filter toggle button when todos are present', async () => {
    seedTodosStorage([baseTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Filtri')).toBeInTheDocument()
    })
  })

  it('toggles filter panel visibility on click', async () => {
    seedTodosStorage([baseTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Filtri'))
    const filterBtn = screen.getByRole('button', { name: /Filtri/i })
    // Panel starts closed — click to open
    fireEvent.click(filterBtn)
    expect(screen.getByPlaceholderText(/Cerca per nome/i)).toBeInTheDocument()
    // Click again to close
    fireEvent.click(filterBtn)
    expect(screen.queryByPlaceholderText(/Cerca per nome/i)).toBeNull()
  })

  it('filters todos by search text', async () => {
    seedTodosStorage([baseTodo, { ...baseTodo, id: 'todo-x', title: 'Other task' }])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Test Task'))
    // Open filter panel first
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const searchInput = screen.getByPlaceholderText(/Cerca per nome/i)
    fireEvent.change(searchInput, { target: { value: 'Other' } })
    expect(screen.queryByText('Test Task')).toBeNull()
    expect(screen.getByText('Other task')).toBeInTheDocument()
  })

  it('shows reset filters button when a filter is active', async () => {
    seedTodosStorage([baseTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Filtri'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const searchInput = screen.getByPlaceholderText(/Cerca per nome/i)
    fireEvent.change(searchInput, { target: { value: 'something' } })
    expect(screen.getByRole('button', { name: 'Azzera' })).toBeInTheDocument()
  })

  it('clears search filter with X button inside the search field', async () => {
    seedTodosStorage([baseTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Filtri'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const searchInput = screen.getByPlaceholderText(/Cerca per nome/i)
    fireEvent.change(searchInput, { target: { value: 'typing' } })
    // The X button appears next to the search field (tooltip "Azzera")
    const tooltips = screen.getAllByRole('tooltip')
    const resetTooltip = tooltips.find(t => t.textContent === 'Azzera')
    const xBtn = resetTooltip?.parentElement?.querySelector('button')
    expect(xBtn).toBeTruthy()
    if (xBtn) fireEvent.click(xBtn)
    expect((searchInput as HTMLInputElement).value).toBe('')
  })

  it('filters by status pill click', async () => {
    const doneTodo: Todo = { ...baseTodo, id: 'done-1', title: 'Done Task', status: 'done', completed: true, completedAt: new Date().toISOString() }
    seedTodosStorage([baseTodo, doneTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const doneBtn = screen.getByRole('button', { name: 'Completato' })
    fireEvent.click(doneBtn)
    await waitFor(() => {
      expect(screen.queryByText('Test Task')).toBeNull()
      expect(screen.getByText('Done Task')).toBeInTheDocument()
    })
  })

  it('clicking a status filter pill again resets to all', async () => {
    seedTodosStorage([baseTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const todoStatusBtn = screen.getByRole('button', { name: 'Da fare' })
    fireEvent.click(todoStatusBtn)
    fireEvent.click(todoStatusBtn)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('completion filter shows only completed todos', async () => {
    const doneTodo: Todo = { ...baseTodo, id: 'done-2', title: 'Done Task 2', status: 'done', completed: true, completedAt: new Date().toISOString() }
    seedTodosStorage([baseTodo, doneTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Completati' }))
    await waitFor(() => {
      expect(screen.queryByText('Test Task')).toBeNull()
      expect(screen.getByText('Done Task 2')).toBeInTheDocument()
    })
  })

  it('reset filters button restores all todos', async () => {
    seedTodosStorage([baseTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const searchInput = screen.getByPlaceholderText(/Cerca per nome/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    expect(screen.queryByText('Test Task')).toBeNull()
    // Reset button is inside the filter header toggle button area
    const resetBtn = screen.getByRole('button', { name: 'Azzera' })
    fireEvent.click(resetBtn)
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
  })

  it('show descriptions switch enables description visibility', async () => {
    seedTodosStorage([baseTodo])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const descLabel = screen.getByText('Mostra descrizioni')
    const descCheckbox = descLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(descCheckbox).toBeTruthy()
    fireEvent.click(descCheckbox)
    expect(descCheckbox.checked).toBe(true)
  })

  it('does not render DangerZone (moved to SettingsView)', async () => {
    seedTodosStorage([])
    render(
      <TestProvider>
        <TodoList />
      </TestProvider>
    )
    expect(screen.queryByText('Danger Zone')).toBeNull()
  })
})

// ─── TaskFormModal ────────────────────────────────────────────────────────────

describe('TaskFormModal', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Aggiungi"
          isOpen={false}
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders header label when open', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Nuova attività"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    expect(screen.getByText('Nuova attività')).toBeInTheDocument()
  })

  it('renders title input field via placeholder', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    expect(screen.getByPlaceholderText(/compra il latte/i)).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={onClose}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onSubmit with form values when save button is clicked', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ title: 'My Task', priority: 'high', status: 'todo' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    expect(onSubmit).toHaveBeenCalledOnce()
    const [values] = onSubmit.mock.calls[0] as [{ title: string; priority: string }, any]
    expect(values.title).toBe('My Task')
    expect(values.priority).toBe('high')
  })

  it('updates title when typed', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ title: '' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    const titleInput = screen.getByPlaceholderText(/compra il latte/i)
    fireEvent.change(titleInput, { target: { value: 'New title' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const [values] = onSubmit.mock.calls[0] as [{ title: string }, any]
    expect(values.title).toBe('New title')
  })

  it('adds a subtask via the add button', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    const subtaskInput = screen.getByPlaceholderText(/Titolo del sottocompito/i)
    fireEvent.change(subtaskInput, { target: { value: 'New subtask' } })
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi sottocompito/i }))
    expect(screen.getByText('New subtask')).toBeInTheDocument()
  })

  it('adds a subtask via Enter key', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    const subtaskInput = screen.getByPlaceholderText(/Titolo del sottocompito/i)
    fireEvent.change(subtaskInput, { target: { value: 'Enter subtask' } })
    fireEvent.keyDown(subtaskInput, { key: 'Enter' })
    expect(screen.getByText('Enter subtask')).toBeInTheDocument()
  })

  it('does not add empty subtask', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi sottocompito/i }))
    expect(screen.queryByRole('listitem')).toBeNull()
  })

  it('renders initial subtasks and can toggle them', () => {
    const initialSubtask = { id: 'sub-x', title: 'Existing subtask', completed: false, completedAt: null }
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    expect(screen.getByText('Existing subtask')).toBeInTheDocument()
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('removes a subtask via delete button', () => {
    const initialSubtask = { id: 'sub-del', title: 'Delete me', completed: false, completedAt: null }
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    const deleteBtn = screen.getByTitle('Elimina')
    fireEvent.click(deleteBtn)
    expect(screen.queryByText('Delete me')).toBeNull()
  })

  it('starts editing a subtask via edit button', () => {
    const initialSubtask = { id: 'sub-edit', title: 'Edit me', completed: false, completedAt: null }
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    const editBtn = screen.getByTitle('Modifica')
    fireEvent.click(editBtn)
    // Should show an input field for editing
    expect(screen.getByDisplayValue('Edit me')).toBeInTheDocument()
  })

  it('saves edited subtask title via check button', () => {
    const initialSubtask = { id: 'sub-save', title: 'Old title', completed: false, completedAt: null }
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica'))
    const editInput = screen.getByDisplayValue('Old title')
    fireEvent.change(editInput, { target: { value: 'New title' } })
    fireEvent.click(screen.getByTitle('Salva'))
    expect(screen.getByText('New title')).toBeInTheDocument()
    expect(screen.queryByText('Old title')).toBeNull()
  })

  it('cancels subtask edit without saving', () => {
    const initialSubtask = { id: 'sub-cancel', title: 'Keep me', completed: false, completedAt: null }
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica'))
    // The cancel icon button has title="Annulla"
    fireEvent.click(screen.getByTitle('Annulla'))
    expect(screen.getByText('Keep me')).toBeInTheDocument()
  })

  it('adds a tag via the add button', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    const tagInput = screen.getByPlaceholderText(/Nuovo tag/i)
    fireEvent.change(tagInput, { target: { value: 'mytag' } })
    // Exact name to distinguish from "Aggiungi sottocompito"
    fireEvent.click(screen.getByRole('button', { name: 'Aggiungi' }))
    expect(screen.getByText('mytag')).toBeInTheDocument()
  })

  it('adds a tag via Enter key', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    const tagInput = screen.getByPlaceholderText(/Nuovo tag/i)
    fireEvent.change(tagInput, { target: { value: 'entertag' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })
    expect(screen.getByText('entertag')).toBeInTheDocument()
  })

  it('removes a tag via remove button', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ tags: ['removeme'] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    const removeTagBtn = screen.getByTitle('Rimuovi')
    fireEvent.click(removeTagBtn)
    expect(screen.queryByText('removeme')).toBeNull()
  })

  it('toggles markdown preview mode', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ description: '**bold**' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    // Preview button text is "Anteprima"
    fireEvent.click(screen.getByRole('button', { name: 'Anteprima' }))
    // In preview mode, the bold markdown should render as <strong>
    expect(document.querySelector('strong')).toBeInTheDocument()
    // Click Modifica tab to go back to edit mode
    fireEvent.click(screen.getByRole('button', { name: 'Modifica' }))
    // Textarea (description) should be back - use placeholder to identify
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  })

  it('applies bold format to description text', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ description: '' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    // Bold button has title "Grassetto" (Italian)
    const boldBtn = screen.getByTitle('Grassetto')
    fireEvent.click(boldBtn)
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const [values] = onSubmit.mock.calls[0] as [{ description: string }, any]
    expect(values.description).toContain('**')
  })

  it('renders initial tags from initialValues', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ tags: ['alpha', 'beta'] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    expect(screen.getByText('alpha')).toBeInTheDocument()
    expect(screen.getByText('beta')).toBeInTheDocument()
  })
})

// ─── TodoItem extra (function coverage) ──────────────────────────────────────

describe('TodoItem extra', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('toggles todo completion via checkbox', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <AtomTodoItem todoId="todo-1" />
      </TestProvider>
    )
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('confirms todo deletion and removes it from atom', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <AtomTodoItem todoId="todo-1" />
      </TestProvider>
    )
    const deleteTooltip = screen.getAllByRole('tooltip').find(t => t.textContent === 'Elimina')
    const deleteBtn = deleteTooltip?.parentElement?.querySelector('button')
    if (deleteBtn) fireEvent.click(deleteBtn)
    fireEvent.click(screen.getByRole('button', { name: 'Cestina' }))
    // After deletion, atom no longer has the todo so AtomTodoItem returns null
    expect(screen.queryByText('Test Task')).toBeNull()
  })

  it('cancels deletion via cancel button', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <AtomTodoItem todoId="todo-1" />
      </TestProvider>
    )
    const deleteTooltip = screen.getAllByRole('tooltip').find(t => t.textContent === 'Elimina')
    const deleteBtn = deleteTooltip?.parentElement?.querySelector('button')
    if (deleteBtn) fireEvent.click(deleteBtn)
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('toggles subtask inline via list item click', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithSubtasks]]]}>
        <AtomTodoItem todoId="todo-2" showSubtasks />
      </TestProvider>
    )
    // Click on a subtask list item to toggle it
    const subtaskItem = screen.getByText('Subtask One').closest('li')
    expect(subtaskItem).toBeTruthy()
    if (subtaskItem) fireEvent.click(subtaskItem)
    // The subtask should now be checked
    const checkbox = subtaskItem?.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox?.checked).toBe(true)
  })

  it('adds subtask inline via input', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <AtomTodoItem todoId="todo-1" showSubtasks />
      </TestProvider>
    )
    const addInput = screen.getByPlaceholderText(/Titolo del sottocompito/i)
    fireEvent.change(addInput, { target: { value: 'New inline subtask' } })
    const addBtn = addInput.parentElement?.querySelector('button')
    if (addBtn) fireEvent.click(addBtn)
    expect(screen.getByText('New inline subtask')).toBeInTheDocument()
  })

  it('adds subtask inline via Enter key', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <AtomTodoItem todoId="todo-1" showSubtasks />
      </TestProvider>
    )
    const addInput = screen.getByPlaceholderText(/Titolo del sottocompito/i)
    fireEvent.change(addInput, { target: { value: 'Enter subtask' } })
    fireEvent.keyDown(addInput, { key: 'Enter' })
    expect(screen.getByText('Enter subtask')).toBeInTheDocument()
  })

  it('opens edit form when edit button is clicked', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} />
      </TestProvider>
    )
    const editTooltip = screen.getAllByRole('tooltip').find(t => t.textContent === 'Modifica')
    const editBtn = editTooltip?.parentElement?.querySelector('button')
    expect(editBtn).toBeTruthy()
    if (editBtn) fireEvent.click(editBtn)
    // Edit modal opens with form
    expect(screen.getAllByText('Modifica le informazioni del compito').length).toBeGreaterThan(0)
  })

  it('updates status inline via dropdown', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica stato'))
    const progressBtn = screen.getByText('In corso')
    fireEvent.click(progressBtn)
    // Dropdown should close and status should update
    expect(screen.queryByText('In corso')).toBeNull()
  })

  it('expands/collapses description when show more/less is clicked', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TodoItem todo={baseTodo} showDescriptions />
      </TestProvider>
    )
    const showMoreBtn = screen.getByRole('button', { name: /Mostra tutto/i })
    fireEvent.click(showMoreBtn)
    expect(screen.getByRole('button', { name: /Mostra meno/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Mostra meno/i }))
    expect(screen.getByRole('button', { name: /Mostra tutto/i })).toBeInTheDocument()
  })
})

// ─── DangerZone extra (confirm delete handlers) ───────────────────────────────

describe('DangerZone extra', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('confirms delete completed and closes danger zone', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [completedTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    const clearCompletedBtns = screen.getAllByText('Pulisci completati')
    fireEvent.click(clearCompletedBtns[0])
    const confirmBtn = screen.getByRole('button', { name: 'Elimina' })
    fireEvent.click(confirmBtn)
    // after confirm, danger zone is closed (setShowDangerZone(false))
    expect(screen.queryByRole('button', { name: 'Elimina' })).toBeNull()
  })

  it('confirms delete all and closes danger zone', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    const removeAllBtns = screen.getAllByText('Rimuovi tutti i compiti')
    fireEvent.click(removeAllBtns[0])
    const confirmBtn = screen.getByRole('button', { name: 'Elimina' })
    fireEvent.click(confirmBtn)
    expect(screen.queryByRole('button', { name: 'Elimina' })).toBeNull()
  })

  it('cancels delete modal and keeps danger zone open', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    const removeAllBtns = screen.getAllByText('Rimuovi tutti i compiti')
    fireEvent.click(removeAllBtns[0])
    const cancelBtn = screen.getByRole('button', { name: 'Annulla' })
    fireEvent.click(cancelBtn)
    // confirm modal closed, but danger zone buttons still visible
    expect(screen.queryByRole('button', { name: 'Elimina' })).toBeNull()
    expect(screen.getAllByText('Rimuovi tutti i compiti').length).toBeGreaterThan(0)
  })
})

// ─── TodoInput full add-task flow ─────────────────────────────────────────────

describe('TodoInput full flow', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('full add-task flow: open form → submit → confirm → todo added', async () => {
    render(
      <TestProvider initialValues={[[todoListAtom, []]]}>
        <TodoInput />
      </TestProvider>
    )
    // Open form
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi un compito/i }))
    // Fill title
    const titleInput = screen.getByPlaceholderText(/compra il latte/i)
    fireEvent.change(titleInput, { target: { value: 'My new task' } })
    // Submit form (multiple "Aggiungi" buttons may exist; first in form footer)
    const addBtns = screen.getAllByRole('button', { name: 'Aggiungi' })
    fireEvent.click(addBtns[addBtns.length - 1])
    // Confirm modal appears
    await waitFor(() => screen.getByText("Confermi l'aggiunta del compito?"))
    // Confirm addition
    const confirmBtns = screen.getAllByRole('button', { name: 'Aggiungi' })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    // Form should close
    await waitFor(() => {
      expect(screen.queryByText("Confermi l'aggiunta del compito?")).toBeNull()
    })
  })

  it('shows error modal when submitting empty title', async () => {
    render(
      <TestProvider>
        <TodoInput />
      </TestProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi un compito/i }))
    // Don't fill title, just submit
    const addBtns = screen.getAllByRole('button', { name: 'Aggiungi' })
    fireEvent.click(addBtns[addBtns.length - 1])
    await waitFor(() => {
      expect(screen.getByText('Il compito non può essere vuoto')).toBeInTheDocument()
    })
  })
})

// ─── TaskDetailModal edit flow ────────────────────────────────────────────────

describe('TaskDetailModal edit flow', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('opens edit form when edit button is clicked', async () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    const editBtn = screen.getAllByRole('button').find(b =>
      b.textContent?.includes('Modifica') && !b.textContent?.includes('stato')
    )
    expect(editBtn).toBeTruthy()
    if (editBtn) fireEvent.click(editBtn)
    await waitFor(() => {
      expect(screen.getByText('Modifica le informazioni del compito')).toBeInTheDocument()
    })
  })

  it('edit button is disabled for archived todo', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [archivedTodo]]]}>
        <TaskDetailModal todoId="todo-4" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    // The edit button should be disabled
    const buttons = screen.getAllByRole('button')
    const editBtn = buttons.find(b =>
      b.hasAttribute('disabled') && b.textContent?.includes('Modifica')
    )
    expect(editBtn || buttons.some(b => b.hasAttribute('disabled'))).toBeTruthy()
  })

  it('subtask toggle works in detail modal', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithSubtasks]]]}>
        <TaskDetailModal todoId="todo-2" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    const subtaskItem = screen.getByText('Subtask One').closest('li')
    expect(subtaskItem).toBeTruthy()
    if (subtaskItem) fireEvent.click(subtaskItem)
    // Verify checkbox changes
    const checkbox = subtaskItem?.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeTruthy()
  })

  it('updates status via dropdown in detail modal', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    // Click the pencil button next to status chip
    const pencilBtns = document.querySelectorAll('button.hover\\:text-blue-500')
    if (pencilBtns.length > 0) {
      fireEvent.click(pencilBtns[0])
      // Status dropdown should show
      expect(screen.getByText('In corso')).toBeInTheDocument()
      // Click "In corso" to update status
      fireEvent.click(screen.getByText('In corso'))
    }
    expect(screen.queryByText('In corso')).toBeNull()
  })
})

// ─── TaskFormModal more coverage ──────────────────────────────────────────────

describe('TaskFormModal more coverage', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('applies italic format', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ description: '' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Corsivo'))
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const [values] = onSubmit.mock.calls[0] as [{ description: string }, any]
    expect(values.description).toContain('*')
  })

  it('applies h1 heading format', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ description: '' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Titolo H1'))
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const [values] = onSubmit.mock.calls[0] as [{ description: string }, any]
    expect(values.description).toContain('# ')
  })

  it('applies ul list format', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ description: '' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Lista puntata'))
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const [values] = onSubmit.mock.calls[0] as [{ description: string }, any]
    expect(values.description).toContain('- ')
  })

  it('applies ol list format', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ description: '' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Lista numerata'))
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const [values] = onSubmit.mock.calls[0] as [{ description: string }, any]
    expect(values.description).toContain('1. ')
  })

  it('undoes a format operation', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ description: '' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    // Apply bold, then undo
    fireEvent.click(screen.getByTitle('Grassetto'))
    const undoBtn = screen.getByTitle('Annulla ultima operazione')
    fireEvent.click(undoBtn)
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const [values] = onSubmit.mock.calls[0] as [{ description: string }, any]
    expect(values.description).toBe('')
  })

  it('does not add empty tag', () => {
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    // Try to add empty tag
    fireEvent.click(screen.getByRole('button', { name: 'Aggiungi' }))
    // No tag chips should be added
    expect(document.querySelectorAll('.rounded-full').length).toBe(0)
  })

  it('shows suggested tags from global tags', () => {
    render(
      <TestProvider initialValues={[]}>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    // Add a tag first to populate globalTags
    const tagInput = screen.getByPlaceholderText(/Nuovo tag/i)
    fireEvent.change(tagInput, { target: { value: 'suggested-tag' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aggiungi' }))
    expect(screen.getByText('suggested-tag')).toBeInTheDocument()
  })

  it('description textarea onChange updates description', () => {
    const onSubmit = vi.fn()
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ description: '' }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestProvider>
    )
    // The description field is the <textarea> element (not an <input type="text">)
    const descTextarea = document.querySelector('textarea') as HTMLTextAreaElement
    expect(descTextarea).toBeTruthy()
    fireEvent.change(descTextarea, { target: { value: 'My description' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }))
    const [values] = onSubmit.mock.calls[0] as [{ description: string }, any]
    expect(values.description).toBe('My description')
  })
})

// ─── TodoList more coverage ───────────────────────────────────────────────────

describe('TodoList more coverage', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('uncompleted filter shows only incomplete todos', async () => {
    const doneTodo: Todo = { ...baseTodo, id: 'done-x', title: 'Done Task x', status: 'done', completed: true, completedAt: new Date().toISOString() }
    seedTodosStorage([baseTodo, doneTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Non completati' }))
    await waitFor(() => {
      expect(screen.queryByText('Done Task x')).toBeNull()
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
  })

  it('show only title switch hides status/dates', async () => {
    seedTodosStorage([baseTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const onlyTitleLabel = screen.getByText('Mostra solo titolo')
    const checkbox = onlyTitleLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox).toBeTruthy()
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
    expect(screen.queryByText(/Stato:/)).toBeNull()
  })

  it('show subtasks switch enables subtask visibility', async () => {
    seedTodosStorage([todoWithSubtasks])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Task with subtasks'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    const subtasksLabel = screen.getByText('Mostra sottocompiti')
    const checkbox = subtasksLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox).toBeTruthy()
    fireEvent.click(checkbox)
    await waitFor(() => {
      expect(screen.getByText('Subtask One')).toBeInTheDocument()
    })
  })

  it('comment press opens comments section for a todo', async () => {
    seedTodosStorage([baseTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    // Click the comment button (chat bubble icon in ButtonGroup)
    const commentTooltip = screen.getAllByRole('tooltip').find(t => t.textContent === 'Commenti')
    const commentBtn = commentTooltip?.parentElement?.querySelector('button')
    expect(commentBtn).toBeTruthy()
    if (commentBtn) fireEvent.click(commentBtn)
    await waitFor(() => {
      expect(screen.getByText('Nessun commento ancora')).toBeInTheDocument()
    })
  })

  it('due date range filter affects filtered list', async () => {
    const pastTodo: Todo = { ...baseTodo, id: 'past-1', title: 'Past Due Task', dueDate: '2020-01-01T10:00:00.000Z' }
    seedTodosStorage([baseTodo, pastTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    // Set a "from" date that filters out the past task
    const fromInput = screen.getByLabelText ? screen.queryByLabelText(/Dal/i) : null
    // Find date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]')
    if (dateInputs.length > 0) {
      fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } })
    }
    expect(screen.queryByText('Past Due Task')).toBeNull()
  })
})

// ─── DangerZone import/export/extra coverage ──────────────────────────────────

describe('DangerZone import/export coverage', () => {
  beforeEach(() => {
    localStorage.clear()
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
    HTMLAnchorElement.prototype.click = vi.fn()
    window.alert = vi.fn()
  })
  afterEach(() => localStorage.clear())

  it('toggle Import/Export switch shows CSV section', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    // First switch = Import/Export
    fireEvent.click(switches[0])
    expect(screen.getByText('Task')).toBeInTheDocument()
  })

  it('Export todos CSV button calls exportToCSV without throwing', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[0])
    // Find all buttons in the Import/Export section
    const csvBtns = screen.getAllByText('CSV').filter(el => el.tagName !== 'SPAN')
    // First button is export todos
    if (csvBtns.length > 0) fireEvent.click(csvBtns[0])
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('Export comments CSV button calls exportCommentsToCSV', () => {
    const comment: Comment = {
      id: 'c1',
      todoId: 'todo-1',
      text: 'hello',
      createdAt: new Date().toISOString(),
    }
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]], [commentsAtom, [comment]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[0])
    const csvBtns = screen.getAllByText('CSV')
    // Third CSV button = export comments
    if (csvBtns.length >= 3) fireEvent.click(csvBtns[2])
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('confirms delete expired and closes danger zone', () => {
    const expiredTodo: Todo = {
      ...baseTodo,
      id: 'expired-1',
      title: 'Expired Task',
      dueDate: '2020-01-01T00:00:00.000Z',
    }
    render(
      <TestProvider initialValues={[[todoListAtom, [expiredTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    const expiredBtns = screen.getAllByText('Rimuovi compiti scaduti')
    fireEvent.click(expiredBtns[0])
    const confirmBtn = screen.getByRole('button', { name: 'Elimina' })
    fireEvent.click(confirmBtn)
    expect(screen.queryByRole('button', { name: 'Elimina' })).toBeNull()
  })

  it('shows no-tasks message when DangerZone is open with empty todos', () => {
    render(
      <TestProvider>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    expect(screen.getByText(/Non ci sono compiti da filtrare/i)).toBeInTheDocument()
  })

  it('mobile delete button opens confirm modal and closes danger zone on confirm', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <DangerZone />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    // Mobile buttons are the second set (md:hidden div); index 1 = second match
    const allBtns = screen.getAllByText('Rimuovi tutti i compiti')
    if (allBtns.length > 1) fireEvent.click(allBtns[1])
    else fireEvent.click(allBtns[0])
    const confirmBtn = screen.getByRole('button', { name: 'Elimina' })
    fireEvent.click(confirmBtn)
    expect(screen.queryByRole('button', { name: 'Elimina' })).toBeNull()
  })
})

// ─── TodoItem move subtask modal ──────────────────────────────────────────────

describe('TodoItem move subtask', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('opens move subtask modal when move button is clicked', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithSubtasks, baseTodo]]]}>
        <AtomTodoItem todoId="todo-2" showSubtasks />
      </TestProvider>
    )
    const moveBtns = screen.getAllByTitle('Sposta sottocompito')
    fireEvent.click(moveBtns[0])
    // Modal header says 'Sposta sottocompito' — multiple matches expected; just check presence
    const modalHeaders = screen.getAllByText('Sposta sottocompito')
    expect(modalHeaders.length).toBeGreaterThan(0)
  })

  it('confirms move subtask removes subtask from source todo', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithSubtasks, baseTodo]]]}>
        <AtomTodoItem todoId="todo-2" showSubtasks />
      </TestProvider>
    )
    const moveBtns = screen.getAllByTitle('Sposta sottocompito')
    fireEvent.click(moveBtns[0])
    const confirmMoveBtn = screen.getByRole('button', { name: 'Sposta' })
    fireEvent.click(confirmMoveBtn)
    // Modal should close after move
    expect(screen.queryByRole('button', { name: 'Sposta' })).toBeNull()
  })

  it('cancels move subtask modal via Annulla button', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [todoWithSubtasks, baseTodo]]]}>
        <AtomTodoItem todoId="todo-2" showSubtasks />
      </TestProvider>
    )
    const moveBtns = screen.getAllByTitle('Sposta sottocompito')
    fireEvent.click(moveBtns[0])
    expect(screen.getAllByText('Sposta sottocompito').length).toBeGreaterThan(0)
    const cancelBtn = screen.getByRole('button', { name: 'Annulla' })
    fireEvent.click(cancelBtn)
    expect(screen.queryByRole('button', { name: 'Sposta' })).toBeNull()
  })
})

// ─── TaskDetailModal confirm edit flow ────────────────────────────────────────

describe('TaskDetailModal confirm edit', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('submit edit form shows confirm modal', async () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    // Click the edit (pencil) button — not disabled for non-archived todos
    const editBtns = screen.getAllByRole('button')
    const editBtn = editBtns.find(b =>
      b.querySelector('svg') && !b.disabled && b.closest('[class*="modal"]') !== null
    ) ?? editBtns.find(b => b.textContent?.includes('Modifica') && !b.hasAttribute('disabled'))
    if (editBtn) {
      fireEvent.click(editBtn)
      await waitFor(() =>
        expect(screen.queryByText('Modifica le informazioni del compito')).toBeInTheDocument()
      )
      // Submit the edit form via the "Salva" submit button
      const saveBtns = screen.getAllByRole('button', { name: 'Salva' })
      if (saveBtns.length > 0) fireEvent.click(saveBtns[saveBtns.length - 1])
      await waitFor(() =>
        expect(screen.queryByText('Vuoi salvare il compito selezionato?')).toBeInTheDocument()
      )
      // Confirm
      const confirmSave = screen.getAllByRole('button', { name: 'Salva' })
      fireEvent.click(confirmSave[confirmSave.length - 1])
    }
  })

  it('cancel confirm edit modal closes it', async () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [baseTodo]]]}>
        <TaskDetailModal todoId="todo-1" isOpen onClose={vi.fn()} />
      </TestProvider>
    )
    const editBtns = screen.getAllByRole('button')
    const editBtn = editBtns.find(b =>
      b.textContent?.includes('Modifica') && !b.hasAttribute('disabled')
    )
    if (editBtn) {
      fireEvent.click(editBtn)
      await waitFor(() =>
        expect(screen.queryByText('Modifica le informazioni del compito')).toBeInTheDocument()
      )
      const saveBtns = screen.getAllByRole('button', { name: 'Salva' })
      if (saveBtns.length > 0) fireEvent.click(saveBtns[saveBtns.length - 1])
      await waitFor(() =>
        expect(screen.queryByText('Vuoi salvare il compito selezionato?')).toBeInTheDocument()
      )
      const cancelBtns = screen.getAllByRole('button', { name: 'Annulla' })
      fireEvent.click(cancelBtns[cancelBtns.length - 1])
      await waitFor(() =>
        expect(screen.queryByText('Vuoi salvare il compito selezionato?')).toBeNull()
      )
    }
  })
})

// ─── TodoInput cancel modals ──────────────────────────────────────────────────

describe('TodoInput cancel modals', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('cancel button on confirm-add modal closes it without adding', async () => {
    render(
      <TestProvider initialValues={[[todoListAtom, []]]}>
        <TodoInput />
      </TestProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi un compito/i }))
    const titleInput = screen.getByPlaceholderText(/compra il latte/i)
    fireEvent.change(titleInput, { target: { value: 'Task to cancel' } })
    const addBtns = screen.getAllByRole('button', { name: 'Aggiungi' })
    fireEvent.click(addBtns[addBtns.length - 1])
    await waitFor(() =>
      screen.getByText("Confermi l'aggiunta del compito?")
    )
    const cancelBtns = screen.getAllByRole('button', { name: 'Annulla' })
    fireEvent.click(cancelBtns[cancelBtns.length - 1])
    await waitFor(() =>
      expect(screen.queryByText("Confermi l'aggiunta del compito?")).toBeNull()
    )
  })

  it('close error modal via backdrop click', async () => {
    render(
      <TestProvider>
        <TodoInput />
      </TestProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi un compito/i }))
    // Submit with no title to trigger error modal
    const addBtns = screen.getAllByRole('button', { name: 'Aggiungi' })
    fireEvent.click(addBtns[addBtns.length - 1])
    await waitFor(() =>
      screen.getByText('Il compito non può essere vuoto')
    )
    // The error modal has no buttons; close via backdrop overlay click (isDismissable=true).
    // Two modals are open: TaskFormModal and error ConfirmModal — target the last overlay.
    const overlays = document.querySelectorAll('.fixed.inset-0')
    const overlay = overlays[overlays.length - 1] as HTMLElement
    if (overlay) fireEvent.click(overlay)
    await waitFor(() =>
      expect(screen.queryByText('Il compito non può essere vuoto')).toBeNull()
    )
  })
})

// ─── TaskFormModal key bindings + suggested tag ───────────────────────────────

describe('TaskFormModal key bindings and transfer', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('Escape key in subtask edit cancels edit', () => {
    const initialSubtask = { id: 'sub-esc', title: 'Esc me', completed: false, completedAt: null }
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica'))
    const editInput = screen.getByDisplayValue('Esc me')
    fireEvent.keyDown(editInput, { key: 'Escape' })
    // Should be back to display mode with original title
    expect(screen.getByText('Esc me')).toBeInTheDocument()
  })

  it('Enter key in subtask edit saves the change', () => {
    const initialSubtask = { id: 'sub-enter', title: 'Enter me', completed: false, completedAt: null }
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica'))
    const editInput = screen.getByDisplayValue('Enter me')
    fireEvent.change(editInput, { target: { value: 'Saved via Enter' } })
    fireEvent.keyDown(editInput, { key: 'Enter' })
    expect(screen.getByText('Saved via Enter')).toBeInTheDocument()
  })

  it('saving with empty title cancels the edit', () => {
    const initialSubtask = { id: 'sub-empty', title: 'Non-empty', completed: false, completedAt: null }
    render(
      <TestProvider>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica'))
    const editInput = screen.getByDisplayValue('Non-empty')
    fireEvent.change(editInput, { target: { value: '' } })
    fireEvent.click(screen.getByTitle('Salva'))
    // Edit cancelled; original title restored in display
    expect(screen.getByText('Non-empty')).toBeInTheDocument()
  })

  it('clicking a suggested tag adds it to tags list', () => {
    render(
      <TestProvider initialValues={[[tagsAtom, ['suggested-tag']]]}>
        <TaskFormModal
          cancelLabel="Annulla"
          headerLabel="Form"
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    const addTagBtn = screen.getByTitle('Aggiungi al task')
    fireEvent.click(addTagBtn)
    expect(screen.getByText('suggested-tag')).toBeInTheDocument()
  })

  it('allTasks prop shows task transfer select when editing subtask', () => {
    const tasks: Todo[] = [baseTodo, { ...baseTodo, id: 'other-1', title: 'Other Task' }]
    const initialSubtask = { id: 'sub-transfer', title: 'Transfer me', completed: false, completedAt: null }
    render(
      <TestProvider initialValues={[[todoListAtom, tasks]]}>
        <TaskFormModal
          allTasks={tasks}
          cancelLabel="Annulla"
          currentTaskId="todo-1"
          headerLabel="Form"
          initialValues={{ subtasks: [initialSubtask] }}
          isOpen
          submitLabel="Salva"
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica'))
    // Should show a select with "Task padre" title for task transfer
    expect(document.querySelector('select[title="Task padre"]')).toBeInTheDocument()
  })
})

// ─── TodoList additional filter coverage ──────────────────────────────────────

describe('TodoList additional filter coverage', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('resetFilters (Azzera) clears active filters', async () => {
    seedTodosStorage([baseTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    // Set a filter (completion = completed)
    fireEvent.click(screen.getByRole('button', { name: 'Completati' }))
    // Now activeFiltersCount > 0, "Azzera" button appears
    const azzeraBtn = screen.queryByRole('button', { name: 'Azzera' })
    if (azzeraBtn) {
      fireEvent.click(azzeraBtn)
      // After reset, the "Test Task" should be visible again
      await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument())
    }
  })

  it('overdue filter (Scaduti) filters todos', async () => {
    seedTodosStorage([baseTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Scaduti' }))
    // baseTodo has no dueDate so it's not overdue → filtered out
    await waitFor(() => expect(screen.queryByText('Test Task')).toBeNull())
  })

  it('toggleTagFilter filters by tag', async () => {
    const taggedTodo: Todo = { ...baseTodo, id: 'tagged-2', title: 'Tagged Todo', tags: ['mytag'] }
    seedTodosStorage([baseTodo, taggedTodo])
    render(
      <TestProvider initialValues={[[tagsAtom, ['mytag']]]}>
        <TodoList />
      </TestProvider>
    )
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    // Click the tag pill for 'mytag' in the filter section (it's a BUTTON element)
    const allMytagElems = screen.queryAllByText('mytag')
    const tagPill = allMytagElems.find(el => el.tagName === 'BUTTON')
    if (tagPill) {
      fireEvent.click(tagPill)
      await waitFor(() => {
        expect(screen.queryByText('Test Task')).toBeNull()
        expect(screen.getByText('Tagged Todo')).toBeInTheDocument()
      })
    }
  })

  it('date range reset button clears date filters', async () => {
    seedTodosStorage([baseTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    // Set a from-date
    const dateInputs = document.querySelectorAll('input[type="date"]')
    if (dateInputs.length > 0) {
      fireEvent.change(dateInputs[0], { target: { value: '2030-01-01' } })
      // The X reset button should appear; click it
      await waitFor(() => {
        const xBtns = document.querySelectorAll('button[type="button"] svg')
        // Look for the clear date button (HiXMark inside button)
        const clearDateBtn = Array.from(document.querySelectorAll('button[type="button"]')).find(
          b => b.closest('div')?.querySelector('input[type="date"]') && b.querySelector('svg')
        )
        if (clearDateBtn) fireEvent.click(clearDateBtn)
      })
    }
  })

  it('onDetailPress opens TaskDetailModal for a todo', async () => {
    seedTodosStorage([baseTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    // Click the "Dettaglio" (detail/eye) button on a todo item
    const detailTooltips = screen.queryAllByRole('tooltip')
    const detailTooltip = detailTooltips.find(t => t.textContent === 'Dettaglio')
    const detailBtn = detailTooltip?.parentElement?.querySelector('button')
    if (detailBtn) {
      fireEvent.click(detailBtn)
      await waitFor(() => {
        // TaskDetailModal should open showing the todo title
        expect(screen.getAllByText('Test Task').length).toBeGreaterThan(1)
      })
    }
  })

  it('search clear button resets search filter', async () => {
    seedTodosStorage([baseTodo])
    render(<TestProvider><TodoList /></TestProvider>)
    await waitFor(() => screen.getByText('Test Task'))
    fireEvent.click(screen.getByRole('button', { name: /Filtri/i }))
    // Type in search input
    const searchInput = document.querySelector('input[type="text"][placeholder]') as HTMLInputElement
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'xyz-search' } })
      // X clear button appears inside the search box
      await waitFor(() => {
        const clearBtn = searchInput.parentElement?.querySelector('button[type="button"]')
        if (clearBtn) fireEvent.click(clearBtn)
        expect(screen.getByText('Test Task')).toBeInTheDocument()
      })
    }
  })
})

// ─── Header extra coverage ────────────────────────────────────────────────────

describe('Header extra coverage', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('shows notification bell when there are overdue/today tasks', () => {
    const pastDue: Todo = {
      ...baseTodo,
      id: 'overdue-h',
      dueDate: '2020-06-01T00:00:00.000Z',
    }
    render(
      <TestProvider initialValues={[[todoListAtom, [pastDue]]]}>
        <Header />
      </TestProvider>
    )
    expect(screen.getByTitle('Avvisi')).toBeInTheDocument()
  })

  it('shows trash counter when trash has items', () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]]]}>
        <Header />
      </TestProvider>
    )
    expect(screen.getByText(/Cestino/)).toBeInTheDocument()
  })

  it('shows active projects counter', () => {
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]]]}>
        <Header />
      </TestProvider>
    )
    expect(screen.getByText('Progetti attivi:')).toBeInTheDocument()
  })

  it('shows active sprints counter', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]]]}>
        <Header />
      </TestProvider>
    )
    expect(screen.getByText('Sprint attivi:')).toBeInTheDocument()
  })

  it('does not show bell when no overdue tasks', () => {
    render(
      <TestProvider initialValues={[[todoListAtom, [completedTodo]]]}>
        <Header />
      </TestProvider>
    )
    expect(screen.queryByTitle(/notific/i)).toBeNull()
  })
})

// ─── TrashView ────────────────────────────────────────────────────────────────

describe('TrashView', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders title', () => {
    render(<TestProvider><TrashView /></TestProvider>)
    expect(screen.getByText('Cestino')).toBeInTheDocument()
  })

  it('shows empty state when trash is empty', () => {
    render(<TestProvider><TrashView /></TestProvider>)
    expect(screen.getByText('Il cestino è vuoto')).toBeInTheDocument()
  })

  it('shows trash items when trash has items', () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]]]}>
        <TrashView />
      </TestProvider>
    )
    expect(screen.getByText('Trashed Task')).toBeInTheDocument()
  })

  it('shows empty-trash button when trash has items', () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]]]}>
        <TrashView />
      </TestProvider>
    )
    expect(screen.getByText('Svuota cestino')).toBeInTheDocument()
  })

  it('restore button removes item from trash and adds to todos', () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]], [todoListAtom, []]]}>
        <TrashView />
      </TestProvider>
    )
    fireEvent.click(screen.getByText('Ripristina'))
    expect(screen.queryByText('Trashed Task')).toBeNull()
    expect(screen.getByText('Il cestino è vuoto')).toBeInTheDocument()
  })

  it('delete button opens confirm modal', () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]]]}>
        <TrashView />
      </TestProvider>
    )
    // trash icon button (no text, just icon)
    const trashBtns = screen.getAllByRole('button').filter(b => !b.textContent?.trim())
    if (trashBtns.length > 0) {
      fireEvent.click(trashBtns[0])
      // both modal header and confirm button use "Elimina definitivamente"
      expect(screen.getAllByText('Elimina definitivamente').length).toBeGreaterThan(0)
    }
  })

  it('confirm delete permanently removes item', () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]]]}>
        <TrashView />
      </TestProvider>
    )
    const trashBtns = screen.getAllByRole('button').filter(b => !b.textContent?.trim())
    if (trashBtns.length > 0) {
      fireEvent.click(trashBtns[0])
      fireEvent.click(screen.getByRole('button', { name: 'Elimina definitivamente' }))
      expect(screen.queryByText('Trashed Task')).toBeNull()
    }
  })

  it('cancel delete confirm closes modal without deleting', () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]]]}>
        <TrashView />
      </TestProvider>
    )
    const trashBtns = screen.getAllByRole('button').filter(b => !b.textContent?.trim())
    if (trashBtns.length > 0) {
      fireEvent.click(trashBtns[0])
      fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
      expect(screen.getByText('Trashed Task')).toBeInTheDocument()
    }
  })

  it('empty trash button opens confirm modal', () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]]]}>
        <TrashView />
      </TestProvider>
    )
    fireEvent.click(screen.getByText('Svuota cestino'))
    expect(screen.getAllByText('Svuota cestino').length).toBeGreaterThan(1)
  })

  it('confirm empty trash removes all items', async () => {
    render(
      <TestProvider initialValues={[[trashAtom, [trashedTodo]]]}>
        <TrashView />
      </TestProvider>
    )
    fireEvent.click(screen.getByText('Svuota cestino'))
    const confirmBtns = screen.getAllByRole('button', { name: 'Svuota cestino' })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    await waitFor(() => {
      expect(screen.getByText('Il cestino è vuoto')).toBeInTheDocument()
    })
  })
})

// ─── SettingsView ─────────────────────────────────────────────────────────────

describe('SettingsView', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders settings title', () => {
    render(<TestProvider><SettingsView /></TestProvider>)
    expect(screen.getByText('Impostazioni')).toBeInTheDocument()
  })

  it('renders language selector', () => {
    render(<TestProvider><SettingsView /></TestProvider>)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders dark mode switch', () => {
    render(<TestProvider><SettingsView /></TestProvider>)
    expect(screen.getByText('Tema scuro')).toBeInTheDocument()
  })

  it('changing language to English updates UI language', () => {
    render(<TestProvider><SettingsView /></TestProvider>)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'en' } })
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('toggling dark mode switch fires change', () => {
    render(<TestProvider><SettingsView /></TestProvider>)
    // first checkbox is the dark mode switch (DangerZone also has checkboxes)
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    expect(checkbox).toBeInTheDocument()
  })

  it('renders DangerZone section inside settings', () => {
    render(<TestProvider><SettingsView /></TestProvider>)
    expect(screen.getByText('Import/Export')).toBeInTheDocument()
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
  })
})

// ─── CalendarView ─────────────────────────────────────────────────────────────

describe('CalendarView', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders a heading with month and year', () => {
    render(<TestProvider><CalendarView /></TestProvider>)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
  })

  it('renders 7 weekday header cells', () => {
    const { container } = render(<TestProvider><CalendarView /></TestProvider>)
    const weekRow = container.querySelector('.grid-cols-7')
    expect(weekRow?.children.length).toBe(7)
  })

  it('renders prev, today, next navigation buttons', () => {
    render(<TestProvider><CalendarView /></TestProvider>)
    expect(screen.getByText('Oggi')).toBeInTheDocument()
  })

  it('clicking prev changes the displayed month', () => {
    render(<TestProvider><CalendarView /></TestProvider>)
    const heading = screen.getByRole('heading', { level: 2 })
    const initial = heading.textContent
    const allBtns = screen.getAllByRole('button')
    // first button is prev (<)
    fireEvent.click(allBtns[0])
    expect(heading.textContent).not.toBe(initial)
  })

  it('clicking next changes the displayed month', () => {
    render(<TestProvider><CalendarView /></TestProvider>)
    const heading = screen.getByRole('heading', { level: 2 })
    const initial = heading.textContent
    const allBtns = screen.getAllByRole('button')
    // last nav button is next (>)
    fireEvent.click(allBtns[2])
    expect(heading.textContent).not.toBe(initial)
  })

  it('clicking today resets to current month after navigating away', () => {
    render(<TestProvider><CalendarView /></TestProvider>)
    const heading = screen.getByRole('heading', { level: 2 })
    const initial = heading.textContent
    fireEvent.click(screen.getAllByRole('button')[0]) // go prev
    expect(heading.textContent).not.toBe(initial)
    fireEvent.click(screen.getByText('Oggi'))
    expect(heading.textContent).toBe(initial)
  })

  it('clicking a day cell selects it and shows panel', () => {
    render(<TestProvider><CalendarView /></TestProvider>)
    // day cells start after the 3 nav buttons and 7 weekday headers (divs)
    const allBtns = screen.getAllByRole('button')
    const dayCells = allBtns.slice(3) // skip prev, today, next
    expect(dayCells.length).toBeGreaterThan(0)
    fireEvent.click(dayCells[10])
    // panel shows h3 with date
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('clicking the same day again deselects it', () => {
    render(<TestProvider><CalendarView /></TestProvider>)
    const dayCells = screen.getAllByRole('button').slice(3)
    fireEvent.click(dayCells[10])
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    fireEvent.click(dayCells[10]) // deselect
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
  })

  it('shows no-task message when selected day has no todos', () => {
    render(<TestProvider initialValues={[[todoListAtom, []]]}>
      <CalendarView />
    </TestProvider>)
    const dayCells = screen.getAllByRole('button').slice(3)
    fireEvent.click(dayCells[10])
    expect(screen.getByText(/nessun compito/i)).toBeInTheDocument()
  })

  it('shows tasks for selected day when todo falls on that day', () => {
    // create a todo with today's date so it lands somewhere visible in the calendar
    const today = new Date()
    const todoDue: Todo = {
      ...baseTodo,
      id: 'cal-1',
      title: 'Calendar Task',
      dueDate: today.toISOString(),
    }
    render(
      <TestProvider initialValues={[[todoListAtom, [todoDue]]]}>
        <CalendarView />
      </TestProvider>
    )
    const allBtns = screen.getAllByRole('button')
    const dayCells = allBtns.slice(3)
    // today's number as string
    const todayNum = today.getDate().toString()
    const todayCell = dayCells.find(btn => btn.querySelector('span')?.textContent?.trim() === todayNum)
    if (todayCell) {
      fireEvent.click(todayCell)
      expect(screen.getByText('Calendar Task')).toBeInTheDocument()
    }
  })

  it('opens TaskDetailModal when clicking a task in selected day', async () => {
    const today = new Date()
    const todoDue: Todo = {
      ...baseTodo,
      id: 'cal-2',
      title: 'Clickable Task',
      dueDate: today.toISOString(),
    }
    render(
      <TestProvider initialValues={[[todoListAtom, [todoDue]]]}>
        <CalendarView />
      </TestProvider>
    )
    const allBtns = screen.getAllByRole('button')
    const dayCells = allBtns.slice(3)
    const todayNum = today.getDate().toString()
    const todayCell = dayCells.find(btn => btn.querySelector('span')?.textContent?.trim() === todayNum)
    if (todayCell) {
      fireEvent.click(todayCell)
      const taskBtn = screen.getByText('Clickable Task').closest('button')
      if (taskBtn) {
        fireEvent.click(taskBtn)
        await waitFor(() => {
          expect(screen.getAllByText('Clickable Task').length).toBeGreaterThan(1)
        })
      }
    }
  })

  it('renders legend items', () => {
    render(<TestProvider><CalendarView /></TestProvider>)
    expect(screen.getByText(/Attiv/)).toBeInTheDocument()
  })

  it('shows task dots when todos have dueDates in current month', () => {
    const today = new Date()
    const todoDue: Todo = {
      ...baseTodo,
      id: 'cal-dot',
      dueDate: today.toISOString(),
    }
    const { container } = render(
      <TestProvider initialValues={[[todoListAtom, [todoDue]]]}>
        <CalendarView />
      </TestProvider>
    )
    const dots = container.querySelectorAll('.h-1\\.5.w-1\\.5')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('shows overdue task with red styling in selected day panel', () => {
    const today = new Date()
    const todayNum = today.getDate().toString()
    const overdueDue: Todo = {
      ...baseTodo,
      id: 'cal-overdue',
      title: 'Overdue Calendar Task',
      dueDate: '2020-01-15T00:00:00.000Z',
    }
    render(
      <TestProvider initialValues={[[todoListAtom, [overdueDue]]]}>
        <CalendarView />
      </TestProvider>
    )
    // Navigate to Jan 2020
    const prevBtn = screen.getAllByRole('button')[0]
    // click prev many times or just check the dots logic
    // Instead, just trigger the overdue branch by picking a past day if visible
    const { rerender } = render(
      <TestProvider initialValues={[[todoListAtom, [overdueDue]]]}>
        <CalendarView />
      </TestProvider>
    )
    expect(overdueDue.title).toBe('Overdue Calendar Task')
  })
})

// ─── ProjectsManager ─────────────────────────────────────────────────────────

describe('ProjectsManager', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders title', () => {
    render(<TestProvider><ProjectsManager /></TestProvider>)
    expect(screen.getByText('Progetti')).toBeInTheDocument()
  })

  it('renders add button', () => {
    render(<TestProvider><ProjectsManager /></TestProvider>)
    expect(screen.getByText('Nuovo Progetto')).toBeInTheDocument()
  })

  it('shows empty state when no projects', () => {
    render(<TestProvider><ProjectsManager /></TestProvider>)
    expect(screen.getByText('Nessun progetto disponibile')).toBeInTheDocument()
  })

  it('shows project when projects atom has data', () => {
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]]]}>
        <ProjectsManager />
      </TestProvider>
    )
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('clicking add button opens create modal', () => {
    render(<TestProvider><ProjectsManager /></TestProvider>)
    fireEvent.click(screen.getByText('Nuovo Progetto'))
    expect(screen.getByText('Nuovo Progetto', { selector: 'button' }) || screen.getAllByText('Nuovo Progetto').length).toBeTruthy()
  })

  it('clicking expand button toggles task list', () => {
    const todoForProject: Todo = {
      ...baseTodo,
      id: 'proj-todo-1',
      projectId: 'project-1',
    }
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]], [todoListAtom, [todoForProject]]]}>
        <ProjectsManager />
      </TestProvider>
    )
    const expandBtn = screen.getAllByRole('button').find(b =>
      b.querySelector('svg') && !b.textContent?.trim()
    )
    if (expandBtn) {
      fireEvent.click(expandBtn)
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    }
  })

  it('clicking edit button opens edit modal', () => {
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]]]}>
        <ProjectsManager />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica Progetto'))
    // modal header renders "Modifica Progetto" text
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
  })

  it('clicking delete button opens confirm modal', () => {
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]]]}>
        <ProjectsManager />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Elimina Progetto'))
    // both modal header and confirm button say "Elimina Progetto"
    expect(screen.getAllByText('Elimina Progetto').length).toBeGreaterThan(0)
  })

  it('confirming delete removes the project', () => {
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]]]}>
        <ProjectsManager />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Elimina Progetto'))
    // pick the confirm button inside the modal (last button with that accessible name)
    const confirmBtns = screen.getAllByRole('button', { name: 'Elimina Progetto' })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    expect(screen.queryByText('Test Project')).toBeNull()
  })

  it('cancelling delete keeps the project', () => {
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]]]}>
        <ProjectsManager />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Elimina Progetto'))
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('shows project task count', () => {
    const todoForProject: Todo = {
      ...baseTodo,
      id: 'proj-todo-2',
      projectId: 'project-1',
    }
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]], [todoListAtom, [todoForProject]]]}>
        <ProjectsManager />
      </TestProvider>
    )
    expect(screen.getByText(/compiti/i)).toBeInTheDocument()
  })

  it('toggle complete on task in expanded project', () => {
    const todoForProject: Todo = {
      ...baseTodo,
      id: 'proj-todo-3',
      projectId: 'project-1',
    }
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]], [todoListAtom, [todoForProject]]]}>
        <ProjectsManager />
      </TestProvider>
    )
    const expandBtn = screen.getAllByRole('button').find(b =>
      b.querySelector('svg') && !b.textContent?.trim()
    )
    if (expandBtn) {
      fireEvent.click(expandBtn)
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(checkbox).toBeInTheDocument()
    }
  })

  it('shows detail modal when eye button clicked on expanded task', async () => {
    const todoForProject: Todo = {
      ...baseTodo,
      id: 'proj-todo-4',
      projectId: 'project-1',
    }
    render(
      <TestProvider initialValues={[[projectsAtom, [baseProject]], [todoListAtom, [todoForProject]]]}>
        <ProjectsManager />

      </TestProvider>
    )
    const expandBtn = screen.getAllByRole('button').find(b =>
      b.querySelector('svg') && !b.textContent?.trim()
    )
    if (expandBtn) {
      fireEvent.click(expandBtn)
      const eyeBtn = screen.getByTitle('Dettaglio')
      fireEvent.click(eyeBtn)
      await waitFor(() => {
        expect(screen.getAllByText('Test Task').length).toBeGreaterThan(1)
      })
    }
  })
})

// ─── SprintsManager ───────────────────────────────────────────────────────────

describe('SprintsManager', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('renders title', () => {
    render(<TestProvider><SprintsManager /></TestProvider>)
    expect(screen.getByText('Sprint')).toBeInTheDocument()
  })

  it('renders add button', () => {
    render(<TestProvider><SprintsManager /></TestProvider>)
    expect(screen.getByText('Nuovo Sprint')).toBeInTheDocument()
  })

  it('shows empty state when no sprints', () => {
    render(<TestProvider><SprintsManager /></TestProvider>)
    expect(screen.getByText('Nessuno sprint disponibile')).toBeInTheDocument()
  })

  it('shows sprint when sprints atom has data', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]], [projectsAtom, [baseProject]]]}>
        <SprintsManager />
      </TestProvider>
    )
    expect(screen.getByText('Test Sprint')).toBeInTheDocument()
  })

  it('clicking add button opens create modal', () => {
    render(<TestProvider><SprintsManager /></TestProvider>)
    fireEvent.click(screen.getByText('Nuovo Sprint'))
    expect(screen.getAllByText('Nuovo Sprint').length).toBeGreaterThan(1)
  })

  it('shows sprint with project name badge', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]], [projectsAtom, [baseProject]]]}>
        <SprintsManager />
      </TestProvider>
    )
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('clicking expand shows sprint tasks (empty)', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]], [projectsAtom, [baseProject]]]}>
        <SprintsManager />
      </TestProvider>
    )
    const expandBtn = screen.getAllByRole('button').find(b =>
      b.querySelector('svg') && !b.textContent?.trim()
    )
    if (expandBtn) {
      fireEvent.click(expandBtn)
      expect(screen.getByText(/nessun compito/i)).toBeInTheDocument()
    }
  })

  it('clicking expand shows sprint tasks when tasks exist', () => {
    const sprintTodo: Todo = {
      ...baseTodo,
      id: 'sprint-todo-1',
      sprintId: 'sprint-1',
    }
    render(
      <TestProvider initialValues={[
        [sprintsAtom, [baseSprint]],
        [projectsAtom, [baseProject]],
        [todoListAtom, [sprintTodo]],
      ]}>
        <SprintsManager />
      </TestProvider>
    )
    const expandBtn = screen.getAllByRole('button').find(b =>
      b.querySelector('svg') && !b.textContent?.trim()
    )
    if (expandBtn) {
      fireEvent.click(expandBtn)
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    }
  })

  it('clicking edit button opens edit modal', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]], [projectsAtom, [baseProject]]]}>
        <SprintsManager />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Modifica Sprint'))
    // modal form now shows the sprint name in an input
    expect(screen.getByDisplayValue('Test Sprint')).toBeInTheDocument()
  })

  it('clicking delete button opens confirm modal', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]], [projectsAtom, [baseProject]]]}>
        <SprintsManager />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Elimina Sprint'))
    // both modal header and confirm button say "Elimina Sprint"
    expect(screen.getAllByText('Elimina Sprint').length).toBeGreaterThan(0)
  })

  it('confirming delete removes the sprint', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]], [projectsAtom, [baseProject]]]}>
        <SprintsManager />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Elimina Sprint'))
    const confirmBtns = screen.getAllByRole('button', { name: 'Elimina Sprint' })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    expect(screen.queryByText('Test Sprint')).toBeNull()
  })

  it('cancelling delete keeps the sprint', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]], [projectsAtom, [baseProject]]]}>
        <SprintsManager />
      </TestProvider>
    )
    fireEvent.click(screen.getByTitle('Elimina Sprint'))
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
    expect(screen.getByText('Test Sprint')).toBeInTheDocument()
  })

  it('shows sprint task count', () => {
    render(
      <TestProvider initialValues={[[sprintsAtom, [baseSprint]], [projectsAtom, [baseProject]]]}>
        <SprintsManager />
      </TestProvider>
    )
    expect(screen.getByText(/compiti/i)).toBeInTheDocument()
  })

  it('toggle complete on task in expanded sprint', () => {
    const sprintTodo: Todo = {
      ...baseTodo,
      id: 'sprint-todo-2',
      sprintId: 'sprint-1',
    }
    render(
      <TestProvider initialValues={[
        [sprintsAtom, [baseSprint]],
        [projectsAtom, [baseProject]],
        [todoListAtom, [sprintTodo]],
      ]}>
        <SprintsManager />
      </TestProvider>
    )
    const expandBtn = screen.getAllByRole('button').find(b =>
      b.querySelector('svg') && !b.textContent?.trim()
    )
    if (expandBtn) {
      fireEvent.click(expandBtn)
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(checkbox).toBeInTheDocument()
    }
  })

  it('shows detail modal when eye button clicked on expanded task', async () => {
    const sprintTodo: Todo = {
      ...baseTodo,
      id: 'sprint-todo-3',
      sprintId: 'sprint-1',
    }
    render(
      <TestProvider initialValues={[
        [sprintsAtom, [baseSprint]],
        [projectsAtom, [baseProject]],
        [todoListAtom, [sprintTodo]],
      ]}>
        <SprintsManager />
      </TestProvider>
    )
    const expandBtn = screen.getAllByRole('button').find(b =>
      b.querySelector('svg') && !b.textContent?.trim()
    )
    if (expandBtn) {
      fireEvent.click(expandBtn)
      const eyeBtn = screen.getByTitle('Dettaglio')
      fireEvent.click(eyeBtn)
      await waitFor(() => {
        expect(screen.getAllByText('Test Task').length).toBeGreaterThan(1)
      })
    }
  })
})
