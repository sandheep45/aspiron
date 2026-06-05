import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDebounceValue } from '@/hooks/use-debounce-value'

describe('useDebounceValue', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounceValue('hello', 300))
    expect(result.current[0]).toBe('hello')
  })

  it('returns initial value from lazy initializer', () => {
    const { result } = renderHook(() => useDebounceValue(() => 'lazy', 300))
    expect(result.current[0]).toBe('lazy')
  })

  it('does not update before delay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDebounceValue('initial', 300))
    act(() => result.current[1]('updated'))
    expect(result.current[0]).toBe('initial')
    vi.useRealTimers()
  })

  it('updates after delay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDebounceValue('initial', 300))
    act(() => result.current[1]('updated'))
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current[0]).toBe('updated')
    vi.useRealTimers()
  })

  it('resets timer on rapid calls', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDebounceValue('initial', 300))
    act(() => result.current[1]('first'))
    act(() => {
      vi.advanceTimersByTime(100)
    })
    act(() => result.current[1]('second'))
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current[0]).toBe('initial')
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current[0]).toBe('second')
    vi.useRealTimers()
  })

  it('cleans up timer on unmount', () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { result, unmount } = renderHook(() => useDebounceValue('x', 300))
    act(() => result.current[1]('y'))
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
    vi.useRealTimers()
  })
})
