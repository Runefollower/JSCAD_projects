import { primitives, transforms } from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type SmoothChainLinkParams = {
  outerRadius: number
  tubeRadius: number
  stretchY: number
  innerSegments: number
  outerSegments: number
}

const { torus } = primitives
const { scale } = transforms

const chainLink = ({
  outerRadius,
  tubeRadius,
  stretchY,
  innerSegments,
  outerSegments
}: SmoothChainLinkParams) => {
  const base = torus({
    outerRadius,
    innerRadius: tubeRadius,
    outerSegments,
    innerSegments
  })

  return scale([1, stretchY, 1], base)
}

export const smoothChainLinkModel: ModelModule<SmoothChainLinkParams> = {
  id: 'chainlink-smooth',
  title: 'Smooth Chain Link',
  collection: 'ChainLink',
  description: 'A stretched torus for smoother chain or chainmail experiments.',
  getParameterDefinitions: () => [
    {
      name: 'outerRadius',
      caption: 'Outer Radius',
      type: 'float',
      initial: 20,
      min: 6,
      max: 60,
      step: 0.5
    },
    {
      name: 'tubeRadius',
      caption: 'Tube Radius',
      type: 'float',
      initial: 5,
      min: 1,
      max: 18,
      step: 0.25
    },
    {
      name: 'stretchY',
      caption: 'Y Stretch',
      type: 'float',
      initial: 2,
      min: 0.5,
      max: 4,
      step: 0.1
    },
    {
      name: 'innerSegments',
      caption: 'Inner Segments',
      type: 'int',
      initial: 32,
      min: 8,
      max: 96,
      step: 4
    },
    {
      name: 'outerSegments',
      caption: 'Outer Segments',
      type: 'int',
      initial: 64,
      min: 8,
      max: 128,
      step: 4
    }
  ],
  main: (params) => chainLink(params)
}
