import { booleans, extrusions, primitives, transforms } from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type SimpleChainLinkParams = {
  width: number
  height: number
  wallRatio: number
  barThickness: number
  segments: number
}

const { subtract, union } = booleans
const { extrudeLinear } = extrusions
const { cuboid, ellipse } = primitives
const { translate } = transforms

const createLink = ({
  width,
  height,
  wallRatio,
  barThickness,
  segments
}: SimpleChainLinkParams) => {
  const mainOval = ellipse({ radius: [width / 2, height / 2], segments })
  const innerOval = ellipse({
    radius: [(width * wallRatio) / 2, (height * wallRatio) / 2],
    segments
  })
  const hollowLink2D = subtract(mainOval, innerOval)
  const hollowLink3D = extrudeLinear({ height: barThickness }, hollowLink2D)
  const bar = translate(
    [0, 0, barThickness / 2],
    cuboid({ size: [barThickness, height, barThickness] })
  )

  return union(hollowLink3D, bar)
}

export const simpleChainLinkModel: ModelModule<SimpleChainLinkParams> = {
  id: 'chainlink-simple',
  title: 'Simple Chain Link',
  collection: 'ChainLink',
  description: 'An extruded oval chain link with a center bar.',
  getParameterDefinitions: () => [
    {
      name: 'width',
      caption: 'Width',
      type: 'float',
      initial: 20,
      min: 8,
      max: 60,
      step: 0.5
    },
    {
      name: 'height',
      caption: 'Height',
      type: 'float',
      initial: 10,
      min: 6,
      max: 40,
      step: 0.5
    },
    {
      name: 'wallRatio',
      caption: 'Inner Scale',
      type: 'float',
      initial: 0.7,
      min: 0.35,
      max: 0.9,
      step: 0.05
    },
    {
      name: 'barThickness',
      caption: 'Bar Thickness',
      type: 'float',
      initial: 2,
      min: 1,
      max: 10,
      step: 0.25
    },
    {
      name: 'segments',
      caption: 'Segments',
      type: 'int',
      initial: 48,
      min: 12,
      max: 128,
      step: 4
    }
  ],
  main: (params) => createLink(params)
}
