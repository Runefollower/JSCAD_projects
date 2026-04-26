import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})

Object.defineProperty(window, 'URL', {
  value: {
    ...window.URL,
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => undefined
  },
  writable: true
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  value: ResizeObserverMock,
  writable: true
})
