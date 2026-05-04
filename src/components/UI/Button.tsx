import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children?: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  isDisabled?: boolean
  onPress?: () => void
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
  secondary:
    'border border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30',
  ghost:
    'border border-transparent bg-transparent text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:bg-blue-900/30',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-5 py-2.5 text-lg',
}

function Button({
  children,
  variant = 'ghost',
  size = 'md',
  isDisabled = false,
  onPress,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
      disabled={isDisabled}
      type={type}
      onClick={onPress ?? onClick}
    >
      {children}
    </button>
  )
}

export default Button
