import { booleans, primitives, transforms } from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type CubeFrameParams = {
  frameSize: number
  cutoutSize: number
  offset: number
  steps: number
}

const { subtract, union } = booleans
const { cuboid } = primitives
const { rotateY, rotateZ, translate } = transforms

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

const buildFrameCube = (frameSize: number, cutoutSize: number) => {
  const frame = cuboid({ size: [frameSize, frameSize, frameSize] })
  const cutX = cuboid({ size: [cutoutSize, cutoutSize, frameSize * 1.05] })
  const cutY = cuboid({ size: [cutoutSize, frameSize * 1.05, cutoutSize] })
  const cutZ = cuboid({ size: [frameSize * 1.05, cutoutSize, cutoutSize] })

  return subtract(frame, cutX, cutY, cutZ)
}

const addFrame = (
  rotationDegrees: number,
  tiltDegrees: number,
  frameSize: number,
  cutoutSize: number,
  offset: number
) => {
  const frame = buildFrameCube(frameSize, cutoutSize)
  const tilted = rotateY(toRadians(tiltDegrees), frame)
  const moved = translate([0, offset, 0], tilted)
  return rotateZ(toRadians(rotationDegrees), moved)
}

export const cubeFrameModel: ModelModule<CubeFrameParams> = {
  id: 'funky-cube-frame',
  title: 'Cube Frame',
  collection: 'FunkyStuff',
  description: 'A circular arrangement of hollow frame cubes.',
  getParameterDefinitions: () => [
    {
      name: 'frameSize',
      caption: 'Frame Size',
      type: 'float',
      initial: 8,
      min: 3,
      max: 24,
      step: 0.5
    },
    {
      name: 'cutoutSize',
      caption: 'Cutout Size',
      type: 'float',
      initial: 4,
      min: 1,
      max: 16,
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
  main: ({ frameSize, cutoutSize, offset, steps }) => {
    const increment = 360 / steps
    const shapes = []

    for (let index = 0; index < steps; index += 1) {
      const rotation = index * increment
      shapes.push(addFrame(rotation, rotation, frameSize, cutoutSize, offset))
    }

    return union(...shapes)
  }
}
