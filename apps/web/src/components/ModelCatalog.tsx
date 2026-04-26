import type { ModelModule } from '@jscad-projects/models'

type ModelCatalogProps = {
  groupedModels: Record<string, ModelModule[]>
  selectedModelId: string
  onSelectModel: (modelId: string) => void
}

export const ModelCatalog = ({
  groupedModels,
  selectedModelId,
  onSelectModel
}: ModelCatalogProps) => {
  return (
    <div className="catalog-groups">
      {Object.entries(groupedModels).map(([collection, models]) => (
        <section key={collection} className="catalog-group">
          <h3>{collection}</h3>
          <div className="catalog-items">
            {models.map((model) => {
              const isActive = model.id === selectedModelId

              return (
                <button
                  key={model.id}
                  type="button"
                  className={`catalog-item${isActive ? ' active' : ''}`}
                  onClick={() => onSelectModel(model.id)}
                  aria-pressed={isActive}
                >
                  <strong>{model.title}</strong>
                  <span>{model.description}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

