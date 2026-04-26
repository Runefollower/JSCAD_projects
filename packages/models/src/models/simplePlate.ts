import { booleans, primitives, transforms } from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type SimplePlateParams = {
  width: number
  depth: number
  thickness: number
  pegRadius: number
  pegHeight: number
  pegOffsetX: number
}

const { union } = booleans
const { cuboid, cylinder } = primitives
const { translate } = transforms

export const simplePlateModel: ModelModule<SimplePlateParams> = {
  id: 'testplate-simple',
  title: 'Simple Plate',
  collection: 'TestPlate',
  description: 'A simple rectangular plate with one cylindrical peg.',
  getParameterDefinitions: () => [
    {
      name: 'width',
      caption: 'Width',
      type: 'float',
      initial: 30,
      min: 10,
      max: 80,
      step: 1
    },
    {
      name: 'depth',
      caption: 'Depth',
      type: 'float',
      initial: 60,
      min: 10,
      max: 120,
      step: 1
    },
    {
      name: 'thickness',
      caption: 'Thickness',
      type: 'float',
      initial: 5,
      min: 1,
      max: 20,
      step: 0.5
    },
    {
      name: 'pegRadius',
      caption: 'Peg Radius',
      type: 'float',
      initial: 4,
      min: 1,
      max: 20,
      step: 0.25
    },
    {
      name: 'pegHeight',
      caption: 'Peg Height',
      type: 'float',
      initial: 10,
      min: 1,
      max: 30,
      step: 0.5
    },
    {
      name: 'pegOffsetX',
      caption: 'Peg X Offset',
      type: 'float',
      initial: 1,
      min: -20,
      max: 20,
      step: 0.25
    }
  ],
  main: ({ width, depth, thickness, pegRadius, pegHeight, pegOffsetX }) => {
    const plate = cuboid({ size: [width, depth, thickness], center: [0, 0, thickness / 2] })
    const peg = translate(
      [pegOffsetX, 0, pegHeight / 2],
      cylinder({ radius: pegRadius, height: pegHeight, segments: 48 })
    )

    return union(plate, peg)
  }
}
