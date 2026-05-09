import type React from 'react'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface ButtonGroupProps {
	children: React.ReactNode
	className?: string
	orientation?: 'horizontal' | 'vertical'
	autoOrientation?: boolean
}

function ButtonGroup({
	children,
	orientation = 'horizontal',
	className = '',
	autoOrientation = false,
}: ButtonGroupProps) {
	const [orientationState, setOrientation] = useState(orientation)

	useEffect(() => {
		if (autoOrientation) {
			const handleResize = () => {
				if (window.innerWidth < 768) {
					setOrientation('vertical')
				} else {
					setOrientation('horizontal')
				}
			}

			window.addEventListener('resize', handleResize)
			handleResize()

			return () => window.removeEventListener('resize', handleResize)
		}
	}, [autoOrientation])

	return (
		<>
			<div
				className={twMerge(
					`hidden justify-center md:flex [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button]:rounded-none [&>div:first-child>button]:rounded-l-lg [&>div:last-child>button]:rounded-r-lg [&>div>button]:rounded-none`,
					orientationState === 'horizontal' ? 'flex-row' : 'flex-col',
					className,
				)}
			>
				{children}
			</div>
			<div
				className={twMerge(
					`flex items-center justify-start gap-2 md:hidden`,
					orientationState === 'horizontal' ? 'flex-row' : 'flex-col',
					className,
				)}
			>
				{children}
			</div>
		</>
	)
}

export default ButtonGroup
