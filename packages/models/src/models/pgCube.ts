import {
  booleans,
  expansions,
  extrusions,
  geometries,
  primitives,
  text,
  transforms
} from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type PgCubeParams = {
  variant: string
  insertChar: string
  cubeSize: number
  chamferSize: number
  textThickness: number
  plateHeight: number
  tolerance: number
}

const { subtract, union } = booleans
const { expand } = expansions
const { extrudeLinear } = extrusions
const { path2 } = geometries
const { cuboid } = primitives
const { vectorText } = text
const { rotateX, rotateY, rotateZ, translate } = transforms

const create3DLetter = (
  character: string,
  cubeSize: number,
  textThickness: number,
  options: { delta?: number; flat?: boolean } = {}
) => {
  const delta = options.delta ?? 5
  const isFlat = options.flat ?? false
  const lineSegments = vectorText({ input: character, height: cubeSize / 2.5 })
  const shapes = lineSegments.map((segment) => {
    let shape = path2.fromPoints({}, segment)
    let expanded = expand({ delta, corners: 'round' }, shape)
    let extruded = extrudeLinear({ height: textThickness }, expanded)

    if (!isFlat) {
      extruded = rotateX(Math.PI / 2, extruded)
    }

    return extruded
  })

  return union(...shapes)
}

const generateChamferCutters = (size: number, chamfer: number) => {
  const cutters = []
  const half = size / 2

  let baseCutter = cuboid({ size: [chamfer * 2.5, size * 2, chamfer * 2.5] })
  baseCutter = rotateY(Math.PI / 4, baseCutter)

  cutters.push(translate([half, 0, half], baseCutter))
  cutters.push(translate([-half, 0, half], baseCutter))
  cutters.push(translate([half, 0, -half], baseCutter))
  cutters.push(translate([-half, 0, -half], baseCutter))

  const yCutter = rotateX(Math.PI / 2, baseCutter)
  cutters.push(translate([half, half, 0], yCutter))
  cutters.push(translate([-half, half, 0], yCutter))
  cutters.push(translate([half, -half, 0], yCutter))
  cutters.push(translate([-half, -half, 0], yCutter))

  const xCutter = rotateZ(Math.PI / 2, baseCutter)
  cutters.push(translate([0, half, half], xCutter))
  cutters.push(translate([0, -half, half], xCutter))
  cutters.push(translate([0, half, -half], xCutter))
  cutters.push(translate([0, -half, -half], xCutter))

  return cutters
}

const generateCube = (
  cubeSize: number,
  chamferSize: number,
  textThickness: number
) => {
  const baseCube = cuboid({ size: [cubeSize, cubeSize, cubeSize] })
  const chamferedCube = subtract(baseCube, ...generateChamferCutters(cubeSize, chamferSize))

  let letterP = create3DLetter('P', cubeSize, textThickness)
  letterP = translate(
    [-cubeSize / 3.5, -cubeSize / 2 + textThickness, -cubeSize / 3.5],
    letterP
  )

  let letterG = create3DLetter('G', cubeSize, textThickness)
  letterG = rotateZ(Math.PI / 2, letterG)
  letterG = translate(
    [cubeSize / 2 - textThickness, -cubeSize / 3.5, -cubeSize / 3.5],
    letterG
  )

  return subtract(chamferedCube, letterP, letterG)
}

const generateTestPlate = (
  cubeSize: number,
  plateHeight: number,
  textThickness: number
) => {
  const plate = cuboid({ size: [cubeSize, cubeSize, plateHeight] })
  let letter = create3DLetter('G', cubeSize, textThickness, { flat: true })
  const zPosition = plateHeight / 2 - textThickness
  letter = translate([-cubeSize / 3.5, -cubeSize / 3.5, zPosition], letter)
  return subtract(plate, letter)
}

const generateLetterInsert = (
  character: string,
  cubeSize: number,
  textThickness: number,
  tolerance: number
) => {
  return create3DLetter(character, cubeSize, textThickness, {
    flat: true,
    delta: 5 - tolerance
  })
}

export const pgCubeModel: ModelModule<PgCubeParams> = {
  id: 'funky-pg-cube',
  title: 'PG Cube',
  collection: 'FunkyStuff',
  description: 'A chamfered lettered cube with optional plate and insert variants.',
  getParameterDefinitions: () => [
    {
      name: 'variant',
      caption: 'Variant',
      type: 'choice',
      initial: 'cube',
      values: ['cube', 'plate', 'insert']
    },
    {
      name: 'insertChar',
      caption: 'Insert Letter',
      type: 'choice',
      initial: 'P',
      values: ['P', 'G']
    },
    {
      name: 'cubeSize',
      caption: 'Cube Size',
      type: 'float',
      initial: 55,
      min: 20,
      max: 100,
      step: 1
    },
    {
      name: 'chamferSize',
      caption: 'Chamfer Size',
      type: 'float',
      initial: 0.5,
      min: 0,
      max: 4,
      step: 0.1
    },
    {
      name: 'textThickness',
      caption: 'Text Thickness',
      type: 'float',
      initial: 8,
      min: 1,
      max: 20,
      step: 0.5
    },
    {
      name: 'plateHeight',
      caption: 'Plate Height',
      type: 'float',
      initial: 12,
      min: 2,
      max: 30,
      step: 0.5
    },
    {
      name: 'tolerance',
      caption: 'Insert Tolerance',
      type: 'float',
      initial: 0.4,
      min: 0,
      max: 2,
      step: 0.05
    }
  ],
  main: ({
    variant,
    insertChar,
    cubeSize,
    chamferSize,
    textThickness,
    plateHeight,
    tolerance
  }) => {
    switch (variant) {
      case 'plate':
        return generateTestPlate(cubeSize, plateHeight, textThickness)
      case 'insert':
        return generateLetterInsert(insertChar, cubeSize, textThickness, tolerance)
      case 'cube':
      default:
        return generateCube(cubeSize, chamferSize, textThickness)
    }
  }
}
