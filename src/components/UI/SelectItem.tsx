import React from 'react'

interface SelectItemProps {
  value?: string
  children: React.ReactNode
  startContent?: React.ReactNode
}

function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>
}

export default SelectItem
