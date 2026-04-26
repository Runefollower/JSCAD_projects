import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  asGeometryArray,
  getDefaultParameterValues,
  modelCatalog,
  modelCatalogById,
  type ModelModule,
  type ParameterValues
} from '@jscad-projects/models'

import { ModelCatalog } from './components/ModelCatalog'
import { ParameterPanel } from './components/ParameterPanel'
import { ViewerCanvas } from './components/ViewerCanvas'
import { exportModelAsStl } from './lib/exportStl'
import { getInitialAppState, readParameterValuesFromUrl, writeAppStateToUrl } from './lib/queryState'

export const App = () => {
  const [selectedModelId, setSelectedModelId] = useState(
    () => getInitialAppState(modelCatalog, modelCatalogById).modelId
  )
  const [parameterValues, setParameterValues] = useState<ParameterValues>(
    () => getInitialAppState(modelCatalog, modelCatalogById).parameterValues
  )
  const [renderRevision, setRenderRevision] = useState(0)

  const activeModel = modelCatalogById[selectedModelId] ?? modelCatalog[0]
  const groupedModels = useMemo(() => {
    return modelCatalog.reduce<Record<string, ModelModule[]>>((groups, model) => {
      groups[model.collection] ??= []
      groups[model.collection].push(model)
      return groups
    }, {})
  }, [])

  const definitions = activeModel.getParameterDefinitions?.() ?? []
  const deferredParameterValues = useDeferredValue(parameterValues)

  const renderedModel = useMemo(() => {
    try {
      return {
        error: null,
        geometries: asGeometryArray(activeModel.main(deferredParameterValues))
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Rendering failed.',
        geometries: []
      }
    }
  }, [activeModel, deferredParameterValues, renderRevision])

  useEffect(() => {
    writeAppStateToUrl(activeModel, parameterValues)
  }, [activeModel, parameterValues])

  const handleSelectModel = (modelId: string) => {
    const nextModel = modelCatalogById[modelId] ?? modelCatalog[0]
    const nextParameterValues = readParameterValuesFromUrl(nextModel)

    startTransition(() => {
      setSelectedModelId(nextModel.id)
      setParameterValues(nextParameterValues)
      setRenderRevision((value) => value + 1)
    })
  }

  const handleParameterChange = (name: string, value: boolean | number | string) => {
    startTransition(() => {
      setParameterValues((current) => ({
        ...current,
        [name]: value
      }))
    })
  }

  const handleReset = () => {
    startTransition(() => {
      setParameterValues(getDefaultParameterValues(definitions))
      setRenderRevision((value) => value + 1)
    })
  }

  const handleRender = () => {
    startTransition(() => {
      setRenderRevision((value) => value + 1)
    })
  }

  const handleExport = () => {
    exportModelAsStl(activeModel.id, renderedModel.geometries)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Local JSCAD Workshop</p>
          <h1>JSCAD Projects</h1>
          <p className="topbar-copy">
            Browse the migrated model catalog, tweak parameters, preview geometry, and export STL files locally.
          </p>
        </div>
        <div className="toolbar" role="toolbar" aria-label="Model actions">
          <button type="button" className="ghost-button" onClick={handleReset}>
            Reset Params
          </button>
          <button type="button" className="ghost-button" onClick={handleRender}>
            Re-render
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleExport}
            disabled={renderedModel.geometries.length === 0 || renderedModel.error !== null}
          >
            Export STL
          </button>
        </div>
      </header>

      <main className="workspace-grid">
        <aside className="panel catalog-panel">
          <div className="panel-header">
            <h2>Collections</h2>
            <span>{modelCatalog.length} models</span>
          </div>
          <ModelCatalog
            groupedModels={groupedModels}
            selectedModelId={activeModel.id}
            onSelectModel={handleSelectModel}
          />
        </aside>

        <section className="viewer-panel">
          <div className="viewer-meta">
            <p className="eyebrow">{activeModel.collection}</p>
            <div className="viewer-title-row">
              <h2>{activeModel.title}</h2>
              <span className="status-pill">
                {renderedModel.error ? 'Render Error' : `${renderedModel.geometries.length} geometry item${renderedModel.geometries.length === 1 ? '' : 's'}`}
              </span>
            </div>
            <p className="viewer-description">{activeModel.description}</p>
            {renderedModel.error ? <p className="error-banner">{renderedModel.error}</p> : null}
          </div>
          <ViewerCanvas
            geometries={renderedModel.geometries}
            modelTitle={activeModel.title}
            renderError={renderedModel.error}
          />
        </section>

        <aside className="panel parameters-panel">
          <div className="panel-header">
            <h2>Parameters</h2>
            <span>{definitions.length} controls</span>
          </div>
          <ParameterPanel
            definitions={definitions}
            parameterValues={parameterValues}
            onParameterChange={handleParameterChange}
          />
        </aside>
      </main>
    </div>
  )
}
