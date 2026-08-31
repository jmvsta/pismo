import { useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useDebouncedAutosave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  delayMs = 800,
): AutosaveStatus {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const skipNextRef = useRef(true)
  const savedValueRef = useRef(value)

  useEffect(() => {
    if (skipNextRef.current) {
      skipNextRef.current = false
      return
    }
    if (value === savedValueRef.current) return

    const timeout = setTimeout(async () => {
      setStatus('saving')
      try {
        await onSave(value)
        savedValueRef.current = value
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, delayMs)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs])

  return status
}
