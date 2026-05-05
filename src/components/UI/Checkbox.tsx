import React from 'react'

interface CheckboxProps {
  isSelected?: boolean
  isDisabled?: boolean
  onChange?: () => void
  children?: React.ReactNode
}

function Checkbox({ isSelected, isDisabled, onChange, children }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          checked={isSelected}
          disabled={isDisabled}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          type="checkbox"
          onChange={onChange}
        />
        <div
          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-1 ${
            isSelected
              ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
              : 'border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-700'
          }`}
        >
          {isSelected && (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              viewBox="0 0 12 12"
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
      </div>
      {children}
    </label>
  )
}

export default Checkbox
