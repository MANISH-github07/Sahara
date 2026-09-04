import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  icon: Icon,
  required,
  disabled,
  className = '',
  inputClassName = '',
  autoComplete,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-warm-700"
        >
          {label}
          {required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4.5 h-4.5 text-warm-400" aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={clsx(
            'input-base',
            Icon && 'pl-10',
            isPassword && 'pr-11',
            error && 'input-error',
            disabled && 'opacity-50 cursor-not-allowed bg-warm-50',
            inputClassName,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword
              ? <EyeOff className="w-4.5 h-4.5" aria-hidden="true" />
              : <Eye    className="w-4.5 h-4.5" aria-hidden="true" />
            }
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-danger-600"
        >
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
