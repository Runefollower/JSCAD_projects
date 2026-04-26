# JSCAD Projects

This repository is a collection of small OpenJSCAD / JSCAD modeling experiments for 3D printing and shape exploration. It now also includes a local Node-based workspace and web app for browsing, previewing, and exporting the migrated models.

## Workspace

The project is organized as an `npm` workspace:

- `packages/models`
  - Modern `@jscad/modeling` versions of the project models
  - Shared model catalog and parameter metadata
- `apps/web`
  - React + Vite local web interface
  - Model browser, parameter controls, preview canvas, and STL export

Legacy source folders now live under `object-builds/`.

## Project folders

### `object-builds/ChainLink`
Early work for designing printable chain and chainmail-style parts.

Current models:
- `SimpleChainLink.jscad`
- `SmoothChainLink.jscad`

### `object-builds/FunkyStuff`
Fun objects and novelty pieces, including cube-based prize or game-style designs.

Current models:
- `Cube.jscad`
- `CubeFrame.jscad`
- `PG_Cube.jscad`

### `object-builds/TestPlate`
Simple dimension and fit-check models for 3D printer testing.

Current models:
- `SimplePlate.js`
- `TestPlateHoles.js`
- `TestPlateHoles.jscad`

### `object-builds/Wings`
Basic wing and airfoil-related shapes for experimenting with wing geometry.

Current models:
- `Areofoil.jscad`

### `object-builds/HouseholdParts`
Small practical household parts and adapters.

Current models:
- `SoapPumpAdaptor.jscad`

## Notes on file formats

This repo contains a mix of:
- Legacy-style `.jscad` scripts
- Newer JSCAD JavaScript files such as `SimplePlate.js` that use `@jscad/modeling`
- Migrated TypeScript modules inside `packages/models`

The original folder scripts are still kept as references. The local web app uses the migrated models from `packages/models`.

## Local development

Install dependencies:

```bash
npm install
```

Start the local web app:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build the workspace:

```bash
npm run build
```

## How to use

1. Run `npm install`
2. Start the app with `npm run dev`
3. Open the local Vite URL in your browser
4. Choose a model from the catalog
5. Adjust parameters in the right-side panel
6. Export an STL for slicing when ready

## Typical use cases

- Prototype chain links and chainmail concepts
- Create fun geometric printed objects
- Verify printer tolerances and hole sizing
- Experiment with wing or airfoil forms
- Build small one-off utility parts

## Status

This is a working collection of design experiments and printable model scripts. Expect the original folders and the migrated workspace models to evolve together as new shapes and test pieces are added.
