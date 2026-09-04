import React from 'react'
import clsx from 'clsx'

const sizes = {
  xs:  { wrapper: 'w-7 h-7',   text: 'text-xs'  },
  sm:  { wrapper: 'w-9 h-9',   text: 'text-sm'  },
  md:  { wrapper: 'w-11 h-11', text: 'text-base' },
  lg:  { wrapper: 'w-14 h-14', text: 'text-lg'  },
  xl:  { wrapper: 'w-20 h-20', text: 'text-2xl' },
  '2xl':{ wrapper:'w-28 h-28', text: 'text-4xl' },
}

const colorMap = [
  'bg-primary-100 text-primary-700',
  'bg-teal-100    text-teal-700',
  'bg-lavender-100 text-lavender-700',
  'bg-success-100 text-success-700',
  'bg-warning-100 text-warning-700',
  'bg-sage-100    text-sage-700',
]

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return colorMap[Math.abs(hash) % colorMap.length]
}

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className = '',
  online,
  ...props
}) {
  const { wrapper, text } = sizes[size] || sizes.md
  const color = getColor(name)
  const initials = getInitials(name)

  return (
    <div className={clsx('relative inline-flex flex-shrink-0', wrapper, className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={name ? `${name}'s avatar` : 'User avatar'}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className={clsx(
            'w-full h-full rounded-full flex items-center justify-center font-semibold select-none',
            color,
            text,
          )}
          aria-label={name ? `${name}'s avatar` : 'User avatar'}
        >
          {initials || '?'}
        </div>
      )}
      {online !== undefined && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
            online ? 'bg-success-500' : 'bg-warm-300',
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}
