import { twMerge } from 'tailwind-merge'

interface StatsCardProps {
	label: string
	value: string | number
	className?: string
}

function StatsCard({ label, value, className }: StatsCardProps) {
	return (
		<div
			className={twMerge(
				'rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800',
				className,
			)}
		>
			<p className="text-gray-500 text-sm dark:text-gray-400">{label}</p>
			<p className="mt-1 font-bold text-2xl text-gray-900 dark:text-white">
				{value}
			</p>
		</div>
	)
}

export default StatsCard
