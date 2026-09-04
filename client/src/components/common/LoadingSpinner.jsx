import React from 'react'
import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', className = '', label = 'Loading...' }) {
  const sizes = {
    sm:  'w-5 h-5 border-2',
    md:  'w-8 h-8 border-2',
    lg:  'w-12 h-12 border-3',
    xl:  'w-16 h-16 border-4',
  }
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)} role="status" aria-label={label}>
      <div
        className={clsx(
          'rounded-full border-warm-200 border-t-primary-500 animate-spin',
          sizes[size] || sizes.md,
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-warm-100 border-t-primary-500 animate-spin" aria-hidden="true" />
        <p className="text-sm text-warm-500 font-medium">{label}</p>
      </div>
    </div>
  )
}
