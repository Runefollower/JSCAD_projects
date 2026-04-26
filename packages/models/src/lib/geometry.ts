export const asGeometryArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value
  }

  return [value]
}

