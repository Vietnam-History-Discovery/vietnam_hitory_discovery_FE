import { useEffect, useState } from 'react'

export function useTypewriter(text, { enabled = true, speed = 18 } = {}) {
  const [displayed, setDisplayed] = useState(() => (enabled ? '' : text))
  const [done, setDone] = useState(() => !enabled)

  useEffect(() => {
    if (!enabled) return undefined

    const words = text.split(/(\s+)/)
    let i = 0

    const interval = setInterval(() => {
      i += 1
      setDisplayed(words.slice(0, i).join(''))
      if (i >= words.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { displayed, done }
}
