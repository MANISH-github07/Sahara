import React from 'react'
import { AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function Textarea({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  rows = 4,
  maxLength,
  className = '',
  textareaClassName = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const charCount = value?.length || 0

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-sm font-medium text-warm-700">
            {label}
            {required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
          {maxLength && (
            <span className={clsx(
              'text-xs',
              charCount > maxLength * 0.9 ? 'text-warning-600' : 'text-warm-400',
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={clsx(
          'input-base resize-none',
          error && 'input-error',
          disabled && 'opacity-50 cursor-not-allowed bg-warm-50',
          textareaClassName,
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-danger-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-warm-400">{hint}</p>
      )}
    </div>
  )
}
