import React from 'react'

interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isRequired?: boolean
  className?: string
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  isRequired,
  className = '',
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {isRequired && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <input
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        placeholder={placeholder}
        required={isRequired}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default Input
