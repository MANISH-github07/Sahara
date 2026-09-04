import React from 'react'
import clsx from 'clsx'

export default function Card({
  children,
  className = '',
  hover = false,
  padding = true,
  glass = false,
  onClick,
  as: Tag = 'div',
  ...props
}) {
  return (
    <Tag
      onClick={onClick}
      className={clsx(
        'rounded-2xl border transition-all duration-200',
        glass
          ? 'bg-white/80 backdrop-blur-md border-white/40 shadow-soft'
          : 'bg-white border-warm-100 shadow-card',
        hover && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        onClick && 'cursor-pointer',
        padding && 'p-6',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={clsx('text-base font-semibold text-warm-800', className)}>
      {children}
    </h3>
  )
}
