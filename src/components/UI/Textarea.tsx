import React from 'react'

interface TextareaProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  minRows?: number
  maxRows?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Textarea({
  label,
  value,
  onChange,
  minRows = 3,
  size = 'md',
  className = '',
}: TextareaProps) {
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : ''

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${sizeClass}`}
        rows={minRows}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default Textarea
