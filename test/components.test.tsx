import '@testing-library/jest-dom'

import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import Chip from '../src/components/UI/Chip'
import DatePicker from '../src/components/UI/DatePicker'
import Input from '../src/components/UI/Input'
import Select from '../src/components/UI/Select'
import SelectItem from '../src/components/UI/SelectItem'
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
