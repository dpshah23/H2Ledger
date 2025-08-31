import React from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className = '' }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${className}`}
    />
  )
}
