import React from 'react'

type ButtonColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonVariant = 'solid' | 'light' | 'ghost'

interface ButtonProps {
  children?: React.ReactNode
  color?: ButtonColor
  size?: ButtonSize
  variant?: ButtonVariant
  isDisabled?: boolean
  onPress?: () => void
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const solidColors: Record<ButtonColor, string> = {
  default: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  success: 'bg-green-500 text-white hover:bg-green-600',
  warning: 'bg-yellow-400 text-white hover:bg-yellow-500',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  secondary: 'bg-purple-500 text-white hover:bg-purple-600',
}

const lightColors: Record<ButtonColor, string> = {
  default: 'bg-transparent text-gray-800 hover:bg-gray-50',
  primary: 'bg-transparent text-blue-500 hover:bg-blue-50',
  success: 'bg-transparent text-green-500 hover:bg-green-50',
  warning: 'bg-transparent text-yellow-500 hover:bg-yellow-50',
  danger: 'bg-transparent text-red-500 hover:bg-red-50',
  secondary: 'bg-transparent text-purple-500 hover:bg-purple-50',
}

const ghostColors: Record<ButtonColor, string> = {
  default:
    'bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-50',
  primary:
    'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50',
  success:
    'bg-transparent border border-green-500 text-green-500 hover:bg-green-50',
  warning:
    'bg-transparent border border-yellow-400 text-yellow-500 hover:bg-yellow-50',
  danger: 'bg-transparent border border-red-500 text-red-500 hover:bg-red-50',
  secondary:
    'bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-50',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-5 py-2.5 text-lg',
}

function Button({
  children,
  color = 'default',
  size = 'md',
  variant = 'solid',
  isDisabled = false,
  onPress,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const colorClass =
    variant === 'light'
      ? lightColors[color]
      : variant === 'ghost'
        ? ghostColors[color]
        : solidColors[color]

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${colorClass} ${sizes[size]} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
      disabled={isDisabled}
      type={type}
      onClick={onPress ?? onClick}
    >
      {children}
    </button>
  )
}

export default Button
