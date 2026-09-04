import React from 'react'
import clsx from 'clsx'

function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={clsx('skeleton', className)}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={clsx('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={clsx(
            'h-4 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full',
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={clsx('bg-white rounded-2xl border border-warm-100 p-6 shadow-card', className)}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBlock className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/2 rounded" />
          <SkeletonBlock className="h-3 w-1/3 rounded" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16' }
  return <SkeletonBlock className={clsx(sizes[size] || sizes.md, 'rounded-full')} />
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading dashboard...">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-56 rounded-xl" />
          <SkeletonBlock className="h-4 w-40 rounded" />
        </div>
        <SkeletonBlock className="w-10 h-10 rounded-xl" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-32" />
        </div>
        <div className="space-y-4">
          <SkeletonCard className="h-64" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonBlock
