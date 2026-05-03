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
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
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
