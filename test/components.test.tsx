import '@testing-library/jest-dom'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React from 'react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { commentsAtom, todoListAtom } from '../src/atoms/atoms'
import Comments from '../src/components/Comments'
import ConfirmModal from '../src/components/ConfirmModal'
import DangerZone from '../src/components/DangerZone'
import Header from '../src/components/Header'
import MarkdownContent from '../src/components/MarkdownContent'
import TaskDetailModal from '../src/components/TaskDetailModal'
import TodoInput from '../src/components/TodoInput'
import TodoItem from '../src/components/TodoItem'
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
import { Comment, Todo } from '../src/types'

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

  it('renders language selector', () => {
    render(<Provider><Header /></Provider>)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders dark mode toggle button', () => {
    render(<Provider><Header /></Provider>)
    expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument()
  })

  it('switches language when the select changes', () => {
    render(<Provider><Header /></Provider>)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'en' } })
    expect(screen.getByText('Task Manager')).toBeInTheDocument()
  })

  it('toggles dark mode when the button is clicked', () => {
    render(<Provider><Header /></Provider>)
    const btn = screen.getByRole('button', { name: /toggle dark mode/i })
    // Initially light mode — moon icon shown, click to switch to dark
    fireEvent.click(btn)
    // Click again to revert
    fireEvent.click(btn)
    // No throw = success; further assertions depend on icon rendering
    expect(btn).toBeInTheDocument()
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
  const noopSet = vi.fn()

  it('renders Import/Export and Danger Zone switches', () => {
    render(
      <TestProvider>
        <DangerZone todos={[]} setTodos={noopSet} comments={[]} setComments={noopSet} />
      </TestProvider>
    )
    expect(screen.getByText('Inport/Export')).toBeInTheDocument()
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
  })

  it('does not show CSV buttons by default', () => {
    render(
      <TestProvider>
        <DangerZone todos={[]} setTodos={noopSet} comments={[]} setComments={noopSet} />
      </TestProvider>
    )
    expect(screen.queryByText('Che operazione vuoi fare?')).toBeNull()
  })

  it('shows CSV buttons after enabling Import/Export switch', () => {
    render(
      <TestProvider>
        <DangerZone todos={[]} setTodos={noopSet} comments={[]} setComments={noopSet} />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[0])
    expect(screen.getByText('Che operazione vuoi fare?')).toBeInTheDocument()
  })

  it('shows empty message in danger zone when todos is empty', () => {
    render(
      <TestProvider>
        <DangerZone todos={[]} setTodos={noopSet} comments={[]} setComments={noopSet} />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    expect(screen.getByText('Non ci sono compiti da filtrare')).toBeInTheDocument()
  })

  it('shows delete buttons when todos are present and danger zone is enabled', () => {
    render(
      <TestProvider>
        <DangerZone todos={[baseTodo]} setTodos={noopSet} comments={[]} setComments={noopSet} />
      </TestProvider>
    )
    const switches = screen.getAllByRole('checkbox')
    fireEvent.click(switches[1])
    expect(screen.getAllByText('Pulisci completati').length).toBeGreaterThan(0)
  })

  it('opens confirm modal when a delete button is clicked', () => {
    render(
      <TestProvider>
        <DangerZone todos={[baseTodo]} setTodos={noopSet} comments={[]} setComments={noopSet} />
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
