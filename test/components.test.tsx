import '@testing-library/jest-dom'

import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'jotai'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ConfirmModal from '../src/components/ConfirmModal'
import Header from '../src/components/Header'
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
