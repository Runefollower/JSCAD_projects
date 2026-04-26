import { areofoilModel } from './models/areofoil'
import { cubeBurstModel } from './models/cubeBurst'
import { cubeFrameModel } from './models/cubeFrame'
import { pgCubeModel } from './models/pgCube'
import { simpleChainLinkModel } from './models/simpleChainLink'
import { simplePlateModel } from './models/simplePlate'
import { smoothChainLinkModel } from './models/smoothChainLink'
import { soapPumpAdaptorModel } from './models/soapPumpAdaptor'
import { testPlateHolesModel } from './models/testPlateHoles'

import type { ModelModule } from './lib/types'

export const modelCatalog: ModelModule[] = [
  simpleChainLinkModel,
  smoothChainLinkModel,
  cubeBurstModel,
  cubeFrameModel,
  pgCubeModel,
  simplePlateModel,
  testPlateHolesModel,
  areofoilModel,
  soapPumpAdaptorModel
]

export const modelCatalogById = Object.fromEntries(
  modelCatalog.map((model) => [model.id, model])
) as Record<string, ModelModule>
