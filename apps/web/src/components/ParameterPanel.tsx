import type { ParameterDefinition, ParameterValues } from '@jscad-projects/models'

type ParameterPanelProps = {
  definitions: ParameterDefinition[]
  parameterValues: ParameterValues
  onParameterChange: (name: string, value: boolean | number | string) => void
}

const toInputValue = (value: boolean | number | string | undefined) => {
  if (typeof value === 'boolean') {
    return value
  }

  return value ?? ''
}

export const ParameterPanel = ({
  definitions,
  parameterValues,
  onParameterChange
}: ParameterPanelProps) => {
  if (definitions.length === 0) {
    return <p className="panel-empty">This model has no editable parameters yet.</p>
  }

  return (
    <form className="parameter-form">
      {definitions.map((definition) => {
        const fieldId = `param-${definition.name}`
        const currentValue = parameterValues[definition.name]

        if (definition.type === 'choice') {
          return (
            <label key={definition.name} className="parameter-field" htmlFor={fieldId}>
              <span>{definition.caption ?? definition.name}</span>
              <select
                id={fieldId}
                value={String(currentValue)}
                onChange={(event) => onParameterChange(definition.name, event.target.value)}
              >
                {definition.values.map((optionValue, index) => (
                  <option key={`${definition.name}-${optionValue}`} value={String(optionValue)}>
                    {definition.captions?.[index] ?? optionValue}
                  </option>
                ))}
              </select>
            </label>
          )
        }

        if (definition.type === 'checkbox') {
          return (
            <label key={definition.name} className="parameter-checkbox" htmlFor={fieldId}>
              <input
                id={fieldId}
                type="checkbox"
                checked={Boolean(currentValue)}
                onChange={(event) => onParameterChange(definition.name, event.target.checked)}
              />
              <span>{definition.caption ?? definition.name}</span>
            </label>
          )
        }

        if (definition.type === 'text') {
          return (
            <label key={definition.name} className="parameter-field" htmlFor={fieldId}>
              <span>{definition.caption ?? definition.name}</span>
              <input
                id={fieldId}
                type="text"
                value={String(toInputValue(currentValue))}
                onChange={(event) => onParameterChange(definition.name, event.target.value)}
              />
            </label>
          )
        }

        return (
          <label key={definition.name} className="parameter-field" htmlFor={fieldId}>
            <span>{definition.caption ?? definition.name}</span>
            <input
              id={fieldId}
              type="number"
              min={definition.min}
              max={definition.max}
              step={definition.step ?? (definition.type === 'int' ? 1 : 0.1)}
              value={Number(currentValue)}
              onChange={(event) =>
                onParameterChange(
                  definition.name,
                  definition.type === 'int'
                    ? Math.trunc(Number(event.target.value))
                    : Number(event.target.value)
                )
              }
            />
          </label>
        )
      })}
    </form>
  )
}

