import React from 'react'

type ChipColor = 'default' | 'success' | 'warning' | 'danger'

interface ChipProps {
  color?: ChipColor
  size?: 'sm' | 'md'
  children: React.ReactNode
}

const colors: Record<ChipColor, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
  danger: 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-400',
}

function Chip({ color = 'default', size = 'md', children }: ChipProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colors[color]} ${sizeClass}`}
    >
      {children}
    </span>
  )
}

export default Chip
