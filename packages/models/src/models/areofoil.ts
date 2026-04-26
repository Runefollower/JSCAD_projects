import { booleans, extrusions, primitives, transforms } from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type AreofoilParams = {
  finalLength: number
  finalWidth: number
  outerThickness: number
  innerThickness: number
  innerScale: number
  gridLength: number
  gridGap: number
  scaleFactor: number
}

const { intersect, subtract, union } = booleans
const { extrudeLinear } = extrusions
const { cuboid, polygon } = primitives
const { rotate, rotateX, scale, translate } = transforms

const yt = (x: number, thickness: number) =>
  5 *
  thickness *
  (0.2969 * Math.sqrt(x) -
    0.126 * x -
    0.3516 * x * x +
    0.2843 * x * x * x -
    0.1015 * x * x * x * x)

const flatWing = (length: number, thickness: number) => {
  const aerofoilPoints: Array<[number, number]> = [[0, 0]]
  const stepIncrement = 0.01

  for (let value = stepIncrement; value <= 1; value += stepIncrement) {
    aerofoilPoints.push([value, yt(value, thickness)])
  }

  for (let value = 1 - stepIncrement; value > 0; value -= stepIncrement) {
    aerofoilPoints.push([value, -yt(value, thickness)])
  }

  const aerofoilCrossSection = polygon({ points: aerofoilPoints })
  const extrudedWing = extrudeLinear({ height: length }, aerofoilCrossSection)
  return rotateX(Math.PI / 2, extrudedWing)
}

const isometricGrid = (
  gridLength: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  gap: number
) => {
  const halfGridLength = gridLength / 2
  const gridHeight = halfGridLength * Math.sqrt(3)
  const xGridStep = gridLength
  const yGridStep = gridHeight * 2

  const triangleSide = gridLength - gap
  const halfTriangleWidth = triangleSide / 2
  const halfTriangleHeight = (halfTriangleWidth * Math.sqrt(3)) / 2

  const triangleA = polygon({
    points: [
      [-halfTriangleWidth, -halfTriangleHeight],
      [halfTriangleWidth, -halfTriangleHeight],
      [0, halfTriangleHeight]
    ]
  })

  const triangleB = polygon({
    points: [
      [0, -halfTriangleHeight],
      [halfTriangleWidth, halfTriangleHeight],
      [-halfTriangleWidth, halfTriangleHeight]
    ]
  })

  const cells = []

  for (let xa = minX; xa < maxX; xa += xGridStep) {
    for (let ya = minY; ya < maxY; ya += yGridStep) {
      const xb = xa + gridLength / 2
      const yb = ya + gridHeight

      cells.push(translate([xa, ya, -0.5], extrudeLinear({ height: 1 }, triangleA)))
      cells.push(translate([xb, ya, -0.5], extrudeLinear({ height: 1 }, triangleB)))
      cells.push(translate([xa, yb, -0.5], extrudeLinear({ height: 1 }, triangleB)))
      cells.push(translate([xb, yb, -0.5], extrudeLinear({ height: 1 }, triangleA)))
    }
  }

  const trimRegion = cuboid({
    size: [maxX - minX, maxY - minY, 1],
    center: [(minX + maxX) / 2, (minY + maxY) / 2, 0]
  })

  return intersect(union(...cells), trimRegion)
}

export const areofoilModel: ModelModule<AreofoilParams> = {
  id: 'wings-areofoil',
  title: 'Areofoil Wing',
  collection: 'Wings',
  description: 'A hollow NACA-style wing with an isometric cutout grid.',
  getParameterDefinitions: () => [
    {
      name: 'finalLength',
      caption: 'Final Length',
      type: 'float',
      initial: 12,
      min: 4,
      max: 40,
      step: 0.5
    },
    {
      name: 'finalWidth',
      caption: 'Final Width',
      type: 'float',
      initial: 4,
      min: 1,
      max: 20,
      step: 0.25
    },
    {
      name: 'outerThickness',
      caption: 'Outer Thickness',
      type: 'float',
      initial: 0.15,
      min: 0.05,
      max: 0.4,
      step: 0.01
    },
    {
      name: 'innerThickness',
      caption: 'Inner Thickness',
      type: 'float',
      initial: 0.1,
      min: 0.02,
      max: 0.3,
      step: 0.01
    },
    {
      name: 'innerScale',
      caption: 'Inner Scale',
      type: 'float',
      initial: 0.8,
      min: 0.5,
      max: 0.98,
      step: 0.01
    },
    {
      name: 'gridLength',
      caption: 'Grid Length',
      type: 'float',
      initial: 1.1,
      min: 0.3,
      max: 4,
      step: 0.05
    },
    {
      name: 'gridGap',
      caption: 'Grid Gap',
      type: 'float',
      initial: 0.2,
      min: 0.01,
      max: 1,
      step: 0.01
    },
    {
      name: 'scaleFactor',
      caption: 'Final Scale',
      type: 'float',
      initial: 10,
      min: 1,
      max: 20,
      step: 0.5
    }
  ],
  main: ({
    finalLength,
    finalWidth,
    outerThickness,
    innerThickness,
    innerScale,
    gridLength,
    gridGap,
    scaleFactor
  }) => {
    const outerWing = flatWing(finalLength / finalWidth, outerThickness)
    const innerWing = translate(
      [0.1, 0.1, 0],
      scale(
        [innerScale, innerScale, innerScale],
        flatWing(2 * (finalLength / finalWidth), innerThickness)
      )
    )

    let hollowWing = subtract(outerWing, innerWing)
    hollowWing = scale([finalWidth, finalWidth, finalWidth], hollowWing)

    const drill = translate(
      [0.5, -0.5, 0],
      rotate([0, 0, -Math.PI / 2], isometricGrid(gridLength, 0, 11, 0, 3, gridGap))
    )

    let gridWing = subtract(hollowWing, drill)

    gridWing = union(
      gridWing,
      translate([0.5, -0.5, -0.2], cuboid({ size: [1, 0.5, 0.4] })),
      translate([0.5, -6.15, -0.2], cuboid({ size: [1, 0.3, 0.4] })),
      translate([0.5, -12, -0.2], cuboid({ size: [1, 0.5, 0.4] }))
    )

    return scale([scaleFactor, scaleFactor, scaleFactor], gridWing)
  }
}
