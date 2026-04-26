import {
  getDefaultParameterValues,
  type ModelModule,
  type ParameterDefinition,
  type ParameterValues
} from '@jscad-projects/models'

const MODEL_QUERY_KEY = 'model'
const PARAM_PREFIX = 'p.'

const parseParameterValue = (definition: ParameterDefinition, rawValue: string) => {
  if (definition.type === 'checkbox') {
    return rawValue === 'true'
  }

  if (definition.type === 'choice') {
    const matchingValue = definition.values.find((value) => String(value) === rawValue)
    return matchingValue ?? definition.initial ?? definition.values[0] ?? ''
  }

  if (definition.type === 'text') {
    return rawValue
  }

  const parsedValue = Number(rawValue)
  if (Number.isNaN(parsedValue)) {
    return definition.initial
  }

  return definition.type === 'int' ? Math.trunc(parsedValue) : parsedValue
}

export const readParameterValuesFromUrl = (model: ModelModule) => {
  const defaults = getDefaultParameterValues(model.getParameterDefinitions?.() ?? [])
  const searchParams = new URLSearchParams(window.location.search)
  const definitions = model.getParameterDefinitions?.() ?? []

  return definitions.reduce<ParameterValues>((values, definition) => {
    const rawValue = searchParams.get(`${PARAM_PREFIX}${definition.name}`)
    if (rawValue === null) {
      return values
    }

    values[definition.name] = parseParameterValue(definition, rawValue)
    return values
  }, { ...defaults })
}

export const getInitialAppState = (
  models: readonly ModelModule[],
  modelMap: Record<string, ModelModule>
) => {
  const searchParams = new URLSearchParams(window.location.search)
  const requestedModelId = searchParams.get(MODEL_QUERY_KEY)
  const model = (requestedModelId && modelMap[requestedModelId]) || models[0]

  return {
    modelId: model.id,
    parameterValues: readParameterValuesFromUrl(model)
  }
}

export const writeAppStateToUrl = (model: ModelModule, parameterValues: ParameterValues) => {
  const searchParams = new URLSearchParams()
  searchParams.set(MODEL_QUERY_KEY, model.id)

  for (const definition of model.getParameterDefinitions?.() ?? []) {
    const value = parameterValues[definition.name]
    if (value !== undefined) {
      searchParams.set(`${PARAM_PREFIX}${definition.name}`, String(value))
    }
  }

  const nextUrl = `${window.location.pathname}?${searchParams.toString()}`
  window.history.replaceState({}, '', nextUrl)
}

