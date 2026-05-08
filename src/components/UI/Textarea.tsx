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

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	function Textarea(
		{ label, value, onChange, minRows = 3, size = 'md', className = '' },
		ref,
	) {
		const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : ''

		return (
			<div className={`flex flex-col gap-1 ${className}`}>
				{label && (
					<label
						htmlFor={label}
						className="font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={label}
					name={label}
					className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${sizeClass}`}
					rows={minRows}
					value={value}
					onChange={onChange}
				/>
			</div>
		)
	},
)

export default Textarea
