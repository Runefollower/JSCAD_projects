import * as stlSerializer from '@jscad/stl-serializer'

export const exportModelAsStl = (modelId: string, geometries: unknown[]) => {
  const rawData = stlSerializer.serialize({ binary: false }, geometries as any)
  const blob = new Blob(rawData as BlobPart[], { type: 'model/stl' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${modelId}.stl`
  anchor.click()
  URL.revokeObjectURL(url)
}

