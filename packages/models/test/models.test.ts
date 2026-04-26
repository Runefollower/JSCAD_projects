import { describe, expect, it } from 'vitest'

import { asGeometryArray, getDefaultParameterValues, modelCatalog } from '../src'

describe('model catalog', () => {
  it('contains all migrated models', () => {
    expect(modelCatalog).toHaveLength(9)
  })

  it('creates renderable geometry for every model using default params', () => {
    for (const model of modelCatalog) {
      const defaults = getDefaultParameterValues(model.getParameterDefinitions?.() ?? [])
      const result = model.main(defaults)
      const geometries = asGeometryArray(result)

      expect(geometries.length).toBeGreaterThan(0)
      expect(geometries.every((geometry) => geometry != null)).toBe(true)
    }
  })
})
