import React from 'react'

interface CheckboxProps {
  isSelected?: boolean
  onChange?: () => void
  children?: React.ReactNode
}

function Checkbox({ isSelected, onChange, children }: CheckboxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        checked={isSelected}
        className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        type="checkbox"
        onChange={onChange}
      />
      {children}
    </label>
  )
}

export default Checkbox
