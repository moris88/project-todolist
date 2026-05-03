import React from 'react'

type ChipColor = 'default' | 'success' | 'warning' | 'danger'

interface ChipProps {
  color?: ChipColor
  size?: 'sm' | 'md'
  children: React.ReactNode
}

const colors: Record<ChipColor, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
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
