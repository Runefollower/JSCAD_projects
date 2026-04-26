import type { ParameterDefinition, ParameterValues } from './types'

export const getDefaultParameterValues = (
  definitions: ParameterDefinition[] = []
): ParameterValues => {
  return definitions.reduce<ParameterValues>((accumulator, definition) => {
    if (definition.type === 'checkbox') {
      accumulator[definition.name] =
        definition.initial ?? definition.checked ?? false
      return accumulator
    }

    if (definition.type === 'choice') {
      accumulator[definition.name] =
        definition.initial ?? definition.values[0] ?? ''
      return accumulator
    }

    if (definition.type === 'text') {
      accumulator[definition.name] = definition.initial ?? ''
      return accumulator
    }

    accumulator[definition.name] = definition.initial
    return accumulator
  }, {})
}

