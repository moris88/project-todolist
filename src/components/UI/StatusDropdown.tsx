import React from 'react'
import { HiOutlinePencilSquare } from 'react-icons/hi2'

import type { Status } from '@/types'
import { ALL_STATUSES, statusChipColor, statusDotColor } from '@/utils'

import Chip from './Chip'

interface StatusDropdownProps {
	status: Status
	statusLabel: string
	statusItems: Record<Status, string>
	onChange: (status: Status) => void
	editTitle?: string
}

function StatusDropdown({
	status,
	statusLabel,
	statusItems,
	onChange,
	editTitle,
}: StatusDropdownProps) {
	const [isOpen, setIsOpen] = React.useState(false)
	const ref = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		if (!isOpen) return
		const handler = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setIsOpen(false)
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [isOpen])

	return (
		<div ref={ref} className="relative">
			<div className="flex items-center gap-1">
				<Chip color={statusChipColor(status)}>
					{statusLabel}: {statusItems[status]}
				</Chip>
				<button
					className="rounded p-0.5 text-gray-400 transition-colors hover:text-blue-500"
					data-testid="status-edit-btn"
					title={editTitle}
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						setIsOpen((v) => !v)
					}}
				>
					<HiOutlinePencilSquare className="h-3.5 w-3.5" />
				</button>
			</div>
			{isOpen && (
				<div className="absolute top-full left-0 z-50 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
					{ALL_STATUSES.map((s) => (
						<button
							key={s}
							className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
								status === s
									? 'font-semibold text-blue-600 dark:text-blue-400'
									: 'text-gray-700 dark:text-gray-300'
							}`}
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								onChange(s)
								setIsOpen(false)
							}}
						>
							<span
								className={`h-2 w-2 shrink-0 rounded-full ${statusDotColor(s)}`}
							/>
							{statusItems[s]}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

export default StatusDropdown
