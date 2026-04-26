import { booleans, primitives, transforms } from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type TestPlateHolesParams = {
  width: number
  depth: number
  thickness: number
  spacing: number
  columns: number
  rows: number
  startBossRadius: number
  bossRadiusStep: number
  startHoleRadius: number
  holeRadiusStep: number
}

const { subtract, union } = booleans
const { cuboid, cylinder } = primitives
const { translate } = transforms

const holeGridPositions = (columns: number, rows: number, spacing: number) => {
  const colOffset = ((columns - 1) / 2) * spacing * -1
  const rowOffset = ((rows - 1) / 2) * spacing * -1
  const points: Array<[number, number]> = []

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      points.push([rowOffset + row * spacing, colOffset + column * spacing])
    }
  }

  return points
}

export const testPlateHolesModel: ModelModule<TestPlateHolesParams> = {
  id: 'testplate-holes',
  title: 'Test Plate Holes',
  collection: 'TestPlate',
  description: 'A fit-test plate with ascending boss and hole diameters.',
  getParameterDefinitions: () => [
    {
      name: 'width',
      caption: 'Width',
      type: 'float',
      initial: 30,
      min: 10,
      max: 100,
      step: 1
    },
    {
      name: 'depth',
      caption: 'Depth',
      type: 'float',
      initial: 60,
      min: 10,
      max: 160,
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
      name: 'spacing',
      caption: 'Spacing',
      type: 'float',
      initial: 10,
      min: 4,
      max: 30,
      step: 0.5
    },
    {
      name: 'columns',
      caption: 'Columns',
      type: 'int',
      initial: 5,
      min: 1,
      max: 10,
      step: 1
    },
    {
      name: 'rows',
      caption: 'Rows',
      type: 'int',
      initial: 3,
      min: 1,
      max: 10,
      step: 1
    },
    {
      name: 'startBossRadius',
      caption: 'Start Boss Radius',
      type: 'float',
      initial: 3.6,
      min: 0.5,
      max: 10,
      step: 0.05
    },
    {
      name: 'bossRadiusStep',
      caption: 'Boss Radius Step',
      type: 'float',
      initial: 0.1,
      min: 0.01,
      max: 1,
      step: 0.01
    },
    {
      name: 'startHoleRadius',
      caption: 'Start Hole Radius',
      type: 'float',
      initial: 0.5,
      min: 0.1,
      max: 5,
      step: 0.05
    },
    {
      name: 'holeRadiusStep',
      caption: 'Hole Radius Step',
      type: 'float',
      initial: 0.1,
      min: 0.01,
      max: 1,
      step: 0.01
    }
  ],
  main: ({
    width,
    depth,
    thickness,
    spacing,
    columns,
    rows,
    startBossRadius,
    bossRadiusStep,
    startHoleRadius,
    holeRadiusStep
  }) => {
    const basePlate = cuboid({ size: [width, depth, thickness], center: [0, 0, thickness / 2] })
    const positions = holeGridPositions(columns, rows, spacing)

    const bosses = positions.map(([x, y], index) =>
      translate(
        [x, y, 5],
        cylinder({
          radius: startBossRadius + index * bossRadiusStep,
          height: 10,
          segments: 48
        })
      )
    )

    const plateWithBosses = union(basePlate, ...bosses)

    const holes = positions.map(([x, y], index) =>
      translate(
        [x, y, 5],
        cylinder({
          radius: startHoleRadius + index * holeRadiusStep,
          height: 10,
          segments: 48
        })
      )
    )

    return subtract(plateWithBosses, ...holes)
  }
}
