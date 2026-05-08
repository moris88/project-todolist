import type React from 'react'

interface SwitchProps {
	children?: React.ReactNode
	size?: 'sm' | 'md' | 'lg'
	color?: 'default' | 'danger'
	checked?: boolean
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	className?: string
}

function Switch({
	children,
	size = 'md',
	color = 'default',
	checked,
	onChange,
	className = '',
}: SwitchProps) {
	const trackColor =
		color === 'danger' ? 'peer-checked:bg-red-500' : 'peer-checked:bg-blue-500'

	const trackSize =
		size === 'sm' ? 'h-4 w-7' : size === 'lg' ? 'h-7 w-12' : 'h-5 w-9'

	const thumbSize =
		size === 'sm'
			? 'h-3 w-3 peer-checked:translate-x-3'
			: size === 'lg'
				? 'h-5 w-5 peer-checked:translate-x-5'
				: 'h-4 w-4 peer-checked:translate-x-4'

	return (
		<label
			className={`inline-flex cursor-pointer items-center gap-2 ${className}`}
		>
			<div className="relative inline-flex items-center">
				<input
					checked={checked}
					className="peer sr-only"
					type="checkbox"
					onChange={onChange}
				/>
				<div
					className={`rounded-full bg-gray-300 transition-colors dark:bg-gray-600 ${trackColor} ${trackSize}`}
				/>
				<div
					className={`absolute left-0.5 rounded-full bg-white shadow transition-transform ${thumbSize}`}
				/>
			</div>
			{children && <span className="text-sm">{children}</span>}
		</label>
	)
}

export default Switch
