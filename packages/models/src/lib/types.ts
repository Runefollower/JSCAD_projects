export type ParameterValue = boolean | number | string
export type ParameterValues = Record<string, ParameterValue>

export type NumericParameterDefinition = {
  name: string
  caption?: string
  type: 'float' | 'int' | 'number'
  initial: number
  min?: number
  max?: number
  step?: number
}

export type ChoiceParameterDefinition = {
  name: string
  caption?: string
  type: 'choice'
  initial?: number | string
  values: Array<number | string>
  captions?: string[]
}

export type CheckboxParameterDefinition = {
  name: string
  caption?: string
  type: 'checkbox'
  initial?: boolean
  checked?: boolean
}

export type TextParameterDefinition = {
  name: string
  caption?: string
  type: 'text'
  initial?: string
}

export type ParameterDefinition =
  | CheckboxParameterDefinition
  | ChoiceParameterDefinition
  | NumericParameterDefinition
  | TextParameterDefinition

export type RenderableGeometry = unknown | unknown[]

export interface ModelModule<TParams extends ParameterValues = ParameterValues> {
  id: string
  title: string
  collection: string
  description: string
  getParameterDefinitions?: () => ParameterDefinition[]
  main(params: TParams): RenderableGeometry
}
