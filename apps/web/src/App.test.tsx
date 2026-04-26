import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from './App'

const serializeMock = vi.fn(() => ['solid mock'])

vi.mock('@jscad/stl-serializer', () => ({
  serialize: (...args: unknown[]) => serializeMock(...args)
}))

vi.mock('./components/ViewerCanvas', () => ({
  ViewerCanvas: ({ geometries, modelTitle }: { geometries: unknown[]; modelTitle: string }) => (
    <div data-testid="viewer-canvas">
      {modelTitle}:{geometries.length}
    </div>
  )
}))

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    serializeMock.mockClear()
  })

  it('renders collections and the initial model viewer', () => {
    render(<App />)

    expect(screen.getByText('JSCAD Projects')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ChainLink' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'FunkyStuff' })).toBeInTheDocument()
    expect(screen.getByTestId('viewer-canvas')).toHaveTextContent('Simple Chain Link')
  })

  it('restores model and parameter state from the URL', () => {
    window.history.replaceState(
      {},
      '',
      '/?model=funky-pg-cube&p.variant=insert&p.insertChar=G'
    )

    render(<App />)

    expect(screen.getByRole('heading', { name: 'PG Cube', level: 2 })).toBeInTheDocument()
    expect(screen.getByLabelText('Variant')).toHaveValue('insert')
    expect(screen.getByLabelText('Insert Letter')).toHaveValue('G')
  })

  it('exports STL and keeps parameter changes reflected in the URL', () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    render(<App />)

    fireEvent.change(screen.getAllByLabelText('Width')[0], {
      target: { value: '28' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Export STL' }))

    expect(serializeMock).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(window.location.search).toContain('p.width=28')

    clickSpy.mockRestore()
  })
})
