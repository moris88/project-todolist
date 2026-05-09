import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { createPortal } from 'react-dom'
import { HiChevronDown } from 'react-icons/hi2'

interface SelectProps {
	label?: string
	defaultSelectedKeys?: string
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
	children?: React.ReactNode
	className?: string
	isDisabled?: boolean
}

interface DropdownPos {
	top?: number
	bottom?: number
	left: number
	width: number
}

const MAX_DROPDOWN_H = 240

function Select({
	label,
	defaultSelectedKeys,
	onChange,
	children,
	className = '',
	isDisabled = false,
}: SelectProps) {
	const [isOpen, setIsOpen] = React.useState(false)
	const [internalValue, setInternalValue] = React.useState(
		defaultSelectedKeys || '',
	)
	const [dropdownPos, setDropdownPos] = React.useState<DropdownPos | null>(null)

	const containerRef = React.useRef<HTMLDivElement>(null)
	const buttonRef = React.useRef<HTMLButtonElement>(null)
	const dropdownRef = React.useRef<HTMLDivElement>(null)

	const currentValue = defaultSelectedKeys ?? internalValue

	const { selectedLabel, selectedStartContent } = React.useMemo(() => {
		let foundLabel: React.ReactNode = ''
		let foundStart: React.ReactNode = null
		React.Children.forEach(children, (child) => {
			if (
				React.isValidElement(child) &&
				(child.props as any).value === currentValue
			) {
				foundLabel = (child.props as any).children
				foundStart = (child.props as any).startContent ?? null
			}
		})
		return { selectedLabel: foundLabel, selectedStartContent: foundStart }
	}, [children, currentValue])

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const clickedContainer = containerRef.current?.contains(
				event.target as Node,
			)
			const clickedDropdown = dropdownRef.current?.contains(
				event.target as Node,
			)
			if (!clickedContainer && !clickedDropdown) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const openDropdown = () => {
		if (!buttonRef.current) {
			setIsOpen((v) => !v)
			return
		}
		const rect = buttonRef.current.getBoundingClientRect()
		const spaceBelow = window.innerHeight - rect.bottom
		const spaceAbove = rect.top
		const openUp = spaceBelow < MAX_DROPDOWN_H && spaceAbove > spaceBelow

		setDropdownPos(
			openUp
				? {
						bottom: window.innerHeight - rect.top + 4,
						left: rect.left,
						width: rect.width,
					}
				: {
						top: rect.bottom + 4,
						left: rect.left,
						width: rect.width,
					},
		)
		setIsOpen((v) => !v)
	}

	const handleSelect = (value: string) => {
		setInternalValue(value)
		setIsOpen(false)
		const event = {
			target: { value, name: '' },
			persist: () => {},
		} as unknown as React.ChangeEvent<HTMLSelectElement>
		onChange(event)
	}

	const updatedChildren = React.Children.map(children, (child) => {
		if (React.isValidElement(child)) {
			return React.cloneElement(child as React.ReactElement<any>, {
				onClick: handleSelect,
				isSelected: !((child.props as any).value === currentValue),
			})
		}
		return child
	})

	return (
		<div
			ref={containerRef}
			className={`relative flex w-full flex-col gap-1 ${className}`}
		>
			{label && (
				<label
					htmlFor={label}
					className="font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					{label}
				</label>
			)}
			<button
				ref={buttonRef}
				id={label}
				name={label}
				className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${isDisabled ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 dark:bg-gray-900' : 'border-gray-300 bg-white'}`}
				disabled={isDisabled}
				type="button"
				onClick={isDisabled ? undefined : openDropdown}
			>
				<span className="flex items-center gap-2 truncate text-sm">
					{selectedStartContent}
					{selectedLabel || 'Seleziona...'}
				</span>
				<HiChevronDown
					className={`h-5 w-5 shrink-0 text-gray-400 transition-transform dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{/* Portal: always mounted, AnimatePresence inside controls mount/unmount of motion.div */}
			{createPortal(
				<AnimatePresence>
					{isOpen && dropdownPos && (
						<motion.div
							ref={dropdownRef}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							initial={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.1 }}
							style={{
								position: 'fixed',
								top: dropdownPos.top,
								bottom: dropdownPos.bottom,
								left: dropdownPos.left,
								width: dropdownPos.width,
								zIndex: 9999,
							}}
							className="max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-600 dark:bg-gray-800"
							onPointerDown={(e) => e.stopPropagation()}
						>
							{updatedChildren}
						</motion.div>
					)}
				</AnimatePresence>,
				document.body,
			)}
		</div>
	)
}

export default Select
