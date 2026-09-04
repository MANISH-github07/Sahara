import { useEffect } from 'react'

/**
 * Attach to any page component to wire up scroll-reveal for all
 * elements that have class="reveal", "reveal-left", or "reveal-right".
 *
 * Usage:
 *   import useScrollReveal from '../../hooks/useScrollReveal'
 *   function MyPage() {
 *     useScrollReveal()
 *     return <div><section className="reveal">...</section></div>
 *   }
 */
export default function useScrollReveal(options = {}) {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right'
    const targets = document.querySelectorAll(selectors)

    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            // Once revealed, stop observing (one-shot animation)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
      }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}
