import { useLayoutEffect, useRef } from 'react'

const MIN_FIT = 0.25
const SEARCH_STEPS = 8

export function useFitText(dependency: unknown) {
  const containerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const fits = () => {
      const style = getComputedStyle(container)
      const availableHeight =
        container.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      const availableWidth =
        container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      return content.offsetHeight <= availableHeight + 0.5 && content.scrollWidth <= availableWidth + 1.5
    }

    const fit = () => {
      container.style.setProperty('--fit', '1')
      if (fits()) return
      let low = MIN_FIT
      let high = 1
      for (let step = 0; step < SEARCH_STEPS; step++) {
        const mid = (low + high) / 2
        container.style.setProperty('--fit', String(mid))
        if (fits()) low = mid
        else high = mid
      }
      container.style.setProperty('--fit', String(low))
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(container)
    document.fonts?.ready.then(fit)
    return () => observer.disconnect()
  }, [dependency])

  return { containerRef, contentRef }
}
