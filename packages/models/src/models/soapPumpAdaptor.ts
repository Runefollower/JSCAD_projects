import { booleans, primitives, transforms } from '@jscad/modeling'

import type { ModelModule } from '../lib/types'

type SoapPumpAdaptorParams = {
  outerRadius: number
  height: number
  innerRadius: number
  topInnerRadius: number
  topInnerHeight: number
  topInnerOffset: number
}

const { subtract } = booleans
const { cylinder } = primitives
const { translate } = transforms

export const soapPumpAdaptorModel: ModelModule<SoapPumpAdaptorParams> = {
  id: 'household-soap-pump-adaptor',
  title: 'Soap Pump Adaptor',
  collection: 'HouseholdParts',
  description: 'A cylindrical adaptor with stepped internal clearances.',
  getParameterDefinitions: () => [
    {
      name: 'outerRadius',
      caption: 'Outer Radius',
      type: 'float',
      initial: 18,
      min: 4,
      max: 40,
      step: 0.5
    },
    {
      name: 'height',
      caption: 'Height',
      type: 'float',
      initial: 28,
      min: 4,
      max: 80,
      step: 0.5
    },
    {
      name: 'innerRadius',
      caption: 'Inner Radius',
      type: 'float',
      initial: 14,
      min: 1,
      max: 36,
      step: 0.5
    },
    {
      name: 'topInnerRadius',
      caption: 'Top Inner Radius',
      type: 'float',
      initial: 15.5,
      min: 1,
      max: 36,
      step: 0.5
    },
    {
      name: 'topInnerHeight',
      caption: 'Top Inner Height',
      type: 'float',
      initial: 10,
      min: 1,
      max: 40,
      step: 0.5
    },
    {
      name: 'topInnerOffset',
      caption: 'Top Inner Offset',
      type: 'float',
      initial: 20,
      min: 0,
      max: 60,
      step: 0.5
    }
  ],
  main: ({
    outerRadius,
    height,
    innerRadius,
    topInnerRadius,
    topInnerHeight,
    topInnerOffset
  }) => {
    const outer = cylinder({ radius: outerRadius, height, center: [0, 0, height / 2], segments: 64 })
    const throughHole = cylinder({
      radius: innerRadius,
      height: height + 2,
      center: [0, 0, (height + 2) / 2],
      segments: 64
    })
    const topRelief = translate(
      [0, 0, topInnerOffset],
      cylinder({
        radius: topInnerRadius,
        height: topInnerHeight,
        center: [0, 0, topInnerHeight / 2],
        segments: 64
      })
    )

    return subtract(outer, throughHole, topRelief)
  }
}
