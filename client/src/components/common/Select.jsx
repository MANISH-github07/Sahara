import React from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  placeholder = 'Select an option',
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-warm-700">
          {label}
          {required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          className={clsx(
            'input-base appearance-none pr-10',
            error && 'input-error',
            disabled && 'opacity-50 cursor-not-allowed bg-warm-50',
            !value && 'text-warm-400',
          )}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" aria-hidden="true" />
      </div>
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-danger-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-warm-400">{hint}</p>}
    </div>
  )
}
