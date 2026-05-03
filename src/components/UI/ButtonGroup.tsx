import React from 'react'

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
}

function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div
      className={`inline-flex [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button]:rounded-none ${className}`}
    >
      {children}
    </div>
  )
}

export default ButtonGroup
