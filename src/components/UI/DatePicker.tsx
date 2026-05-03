import React from 'react'

interface DatePickerProps {
  label?: string
  value?: string | null
  onChange?: (isoString: string | null) => void
  minValue?: string
  granularity?: string
  showMonthAndYearPickers?: boolean
  className?: string
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

function DatePicker({
  label,
  value,
  onChange,
  minValue,
  className = '',
}: DatePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return
    if (!e.target.value) {
      onChange(null)
      return
    }
    onChange(new Date(e.target.value).toISOString())
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        min={minValue}
        type="datetime-local"
        value={toDatetimeLocal(value)}
        onChange={handleChange}
      />
    </div>
  )
}

export default DatePicker
