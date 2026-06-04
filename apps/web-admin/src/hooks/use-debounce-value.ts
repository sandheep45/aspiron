import { useCallback, useEffect, useRef, useState } from 'react'

export function useDebounceValue<T>(
  initialValue: T | (() => T),
  delay: number,
): [T, (value: T) => void] {
  const unwrapped =
    initialValue instanceof Function ? initialValue() : initialValue
  const [debouncedValue, setDebouncedValue] = useState<T>(unwrapped)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setValue = useCallback(
    (value: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
    },
    [delay],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return [debouncedValue, setValue]
}
