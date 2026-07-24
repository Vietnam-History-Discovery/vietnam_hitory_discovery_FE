import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Tracks whether an element has scrolled into view, once. Used to trigger
 * scroll-reveal animations without re-triggering on scroll back-and-forth.
 * Returns { ref, isInView } — isInView is true immediately (no animation) for
 * users with prefers-reduced-motion enabled.
 */
export default function useInView({ threshold = 0.2 } = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(prefersReducedMotion)

  useEffect(() => {
    if (isInView || !ref.current || prefersReducedMotion()) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isInView, threshold])

  return { ref, isInView }
}
