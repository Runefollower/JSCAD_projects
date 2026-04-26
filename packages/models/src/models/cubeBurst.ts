import { booleans, primitives, transforms } from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type CubeBurstParams = {
  coreSize: number
  cubeSize: number
  offset: number
  steps: number
}

const { union } = booleans
const { cuboid } = primitives
const { rotateY, rotateZ, translate } = transforms

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

const addCube = (rotationDegrees: number, tiltDegrees: number, cubeSize: number, offset: number) => {
  const cube = cuboid({ size: [cubeSize, cubeSize, cubeSize] })
  const tilted = rotateY(toRadians(tiltDegrees), cube)
  const moved = translate([0, offset, 0], tilted)
  return rotateZ(toRadians(rotationDegrees), moved)
}

export const cubeBurstModel: ModelModule<CubeBurstParams> = {
  id: 'funky-cube-burst',
  title: 'Cube Burst',
  collection: 'FunkyStuff',
  description: 'A central cube surrounded by tilted orbiting cubes.',
  getParameterDefinitions: () => [
    {
      name: 'coreSize',
      caption: 'Core Size',
      type: 'float',
      initial: 2,
      min: 1,
      max: 20,
      step: 0.5
    },
    {
      name: 'cubeSize',
      caption: 'Outer Cube Size',
      type: 'float',
      initial: 8,
      min: 2,
      max: 24,
      step: 0.5
    },
    {
      name: 'offset',
      caption: 'Orbit Offset',
      type: 'float',
      initial: 8,
      min: 2,
      max: 30,
      step: 0.5
    },
    {
      name: 'steps',
      caption: 'Steps',
      type: 'int',
      initial: 8,
      min: 3,
      max: 24,
      step: 1
    }
  ],
  main: ({ coreSize, cubeSize, offset, steps }) => {
    const increment = 360 / steps
    const shapes = [cuboid({ size: [coreSize, coreSize, coreSize] })]

    for (let index = 0; index < steps; index += 1) {
      const rotation = index * increment
      shapes.push(addCube(rotation, rotation, cubeSize, offset))
    }

    return union(...shapes)
  }
}
