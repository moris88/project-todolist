import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { HiChevronDown } from 'react-icons/hi2'

interface SelectProps {
  label?: string
  defaultSelectedKeys?: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children?: React.ReactNode
  className?: string
}

function Select({
  label,
  defaultSelectedKeys,
  onChange,
  children,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(
    defaultSelectedKeys || ''
  )
  const [selectedLabel, setSelectedLabel] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Sync with defaultSelectedKeys
  React.useEffect(() => {
    if (defaultSelectedKeys !== undefined) {
      setSelectedValue(defaultSelectedKeys)
      let foundLabel = ''
      React.Children.forEach(children, (child) => {
        if (
          React.isValidElement(child) &&
          (child.props as any).value === defaultSelectedKeys
        ) {
          foundLabel = (child.props as any).children
        }
      })
      setSelectedLabel(foundLabel)
    }
  }, [children, defaultSelectedKeys])

  // Click outside handler
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (value: string, label: string) => {
    setSelectedValue(value)
    setSelectedLabel(label)
    setIsOpen(false)

    // Simulate ChangeEvent for compatibility
    const event = {
      target: { value, name: '' },
      persist: () => {},
    } as unknown as React.ChangeEvent<HTMLSelectElement>
    onChange(event)
  }

  const updatedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onClick: handleSelect,
        isSelected: (child.props as any).value === selectedValue,
      })
    }
    return child
  })

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full flex-col gap-1 ${className}`}
    >
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <button
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate text-sm">
          {selectedLabel || 'Seleziona...'}
        </span>
        <HiChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
          >
            {updatedChildren}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Select
