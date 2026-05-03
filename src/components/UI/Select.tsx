import React from 'react'

interface SelectItemData {
  key: string
  label: string
}

interface SelectProps {
  label?: string
  defaultSelectedKeys?: string
  items?: SelectItemData[]
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children?: React.ReactNode
  renderItem?: (item: SelectItemData) => React.ReactNode
  className?: string
}

function Select({
  label,
  defaultSelectedKeys,
  items,
  onChange,
  children,
  renderItem,
  className = '',
}: SelectProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        defaultValue={defaultSelectedKeys}
        onChange={onChange}
      >
        {items && renderItem ? items.map(renderItem) : children}
      </select>
    </div>
  )
}

export default Select
