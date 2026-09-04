import React, { useEffect, useRef } from 'react'

/**
 * Wraps any page/section to play a smooth fade-up entry animation.
 * Uses a CSS class + requestAnimationFrame so it's zero-dependency.
 *
 * Usage:
 *   <PageTransition>
 *     <YourPageContent />
 *   </PageTransition>
 */
export default function PageTransition({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Start invisible then trigger paint → animate
    el.style.opacity = '0'
    el.style.transform = 'translateY(10px)'
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
