import React from 'react'

interface SelectItemProps {
  value: string
  children: React.ReactNode
  startContent?: React.ReactNode
  onClick?: (value: string, label: string) => void
  isSelected?: boolean
}

function SelectItem({
  value,
  children,
  startContent,
  onClick,
  isSelected,
}: SelectItemProps) {
  return (
    <button
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isSelected
          ? 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300'
      }`}
      type="button"
      onClick={() => onClick?.(value, String(children))}
    >
      {startContent && <span className="flex-shrink-0">{startContent}</span>}
      <span className="flex-grow truncate">{children}</span>
    </button>
  )
}

export default SelectItem
