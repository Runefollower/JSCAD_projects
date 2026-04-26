const jscad = require('@jscad/modeling')
const { cuboid } = jscad.primitives
const { union, subtract } = jscad.booleans
const { translate, rotateZ, rotateX, rotateY, center } = jscad.transforms
const { extrudeLinear } = jscad.extrusions
const { vectorText } = jscad.text
const { expand } = jscad.expansions
const { path2 } = jscad.geometries

// --- CONFIGURATION ---
const CUBE_SIZE = 55
const CHAMFER_SIZE = 0.5 
const TEXT_THICKNESS = 8
const PLATE_HEIGHT = 12     // Height for the thin test plate
const TOLERANCE = 0.4       // Gap for the insert (0.4mm is standard for 3D printing fit)

const main = () => {
  // Uncomment the one you want to export:
  
  // 1. The Full Cube
  return generateCube()
  
  // 2. The Test Plate (Flat with etched P)
  // return generateTestPlate()
  
  // 3. The Inserts (Slightly smaller to fit in the hole)
  // return generateLetterInsert("P")
  // return generateLetterInsert("G")
}

const generateTestPlate = () => {
  // 1. Create the base plate (Width/Depth of cube, but short height)
  // Cuboids are centered at [0,0,0], so the top face is at Z = PLATE_HEIGHT / 2
  let plate = cuboid({ size: [CUBE_SIZE, CUBE_SIZE, PLATE_HEIGHT] })

  // 2. Create the Letter 'G' 
  // We use flat:true so it generates on the XY plane (perfect for the top of our plate)
  let letter = create3DLetter('G', { flat: true })
  
  // 3. Position the letter
  // We match the X/Y positioning from the main cube logic (-CUBE_SIZE / 3.5)
  // We position Z so the letter sits flush with the top surface of the plate
  const zPosition = (PLATE_HEIGHT / 2) - TEXT_THICKNESS
  
  // Move it up to the surface, and shift it to the corner location
  letter = translate([-CUBE_SIZE / 3.5, -CUBE_SIZE / 3.5, zPosition], letter)

  // 4. Etch the letter into the plate
  // We also add the chamfer cutters to the plate corners if desired, 
  // but usually a test plate is just for testing the insert fit. 
  // We will leave the plate rectangular for simplicity.
  return subtract(plate, letter)
}

const generateLetterInsert = (char) => {
  // Create the letter, but reduce the expansion delta by the TOLERANCE.
  // This makes the letter slightly thinner than the hole it needs to fit into.
  // We also generate it 'flat' so it is ready to be 3D printed on the bed.
  return create3DLetter(char, { 
    flat: true, 
    delta: 5 - TOLERANCE // Reduce width for clearance
  })
}

const generateCube = () => {
  // 1. Generate the basic Cube
  let myCube = cuboid({ size: [CUBE_SIZE, CUBE_SIZE, CUBE_SIZE] })

  // 2. Generate the Cutters
  const cutters = generateChamferCutters(CUBE_SIZE, CHAMFER_SIZE)

  // 3. Apply the Cutters
  let chamferedCube = subtract(myCube, cutters)

  // 4. Create and Position Letter P (Front)
  // We use standard options (flat: false) to maintain original behavior
  let letterP = create3DLetter('P')
  letterP = translate([-CUBE_SIZE / 3.5, (-CUBE_SIZE / 2)+TEXT_THICKNESS, -CUBE_SIZE / 3.5], letterP) 
  
  // 5. Create and Position Letter G (Right)
  let letterG = create3DLetter('G')
  letterG = rotateZ(Math.PI / 2, letterG)
  letterG = translate([(CUBE_SIZE / 2) - TEXT_THICKNESS, -CUBE_SIZE / 3.5, -CUBE_SIZE / 3.5], letterG)

  // 6. Subtract letters from cube
  const letters = [letterP, letterG]
  return subtract(chamferedCube, letters)
}

// --- HELPER FUNCTIONS ---

const generateChamferCutters = (size, chamfer) => {
  const cutters = []
  const half = size / 2
  
  let baseCutter = cuboid({ size: [chamfer * 2.5, size * 2, chamfer * 2.5] })
  baseCutter = rotateY(Math.PI / 4, baseCutter)

  // Vertical Edges
  cutters.push(translate([half, 0, half], baseCutter))    
  cutters.push(translate([-half, 0, half], baseCutter))   
  cutters.push(translate([half, 0, -half], baseCutter))   
  cutters.push(translate([-half, 0, -half], baseCutter))  

  // Y-axis edges
  let yCutter = rotateX(Math.PI / 2, baseCutter)
  cutters.push(translate([half, half, 0], yCutter))
  cutters.push(translate([-half, half, 0], yCutter))
  cutters.push(translate([half, -half, 0], yCutter))
  cutters.push(translate([-half, -half, 0], yCutter))

  // X-axis edges
  let xCutter = rotateZ(Math.PI / 2, baseCutter)
  cutters.push(translate([0, half, half], xCutter))
  cutters.push(translate([0, -half, half], xCutter))
  cutters.push(translate([0, half, -half], xCutter))
  cutters.push(translate([0, -half, -half], xCutter))

  return cutters
}

/**
 * Creates a 3D letter.
 * @param {string} char - The character to generate.
 * @param {Object} options - Configuration options.
 * @param {boolean} options.flat - If true, returns letter flat on XY plane (for inserts/test plates). If false/undefined, rotates X 90deg (for side of cube).
 * @param {number} options.delta - The expansion radius. Defaults to 5. Use smaller values for inserts.
 */
const create3DLetter = (char, options = {}) => {
  const isFlat = options.flat || false
  const delta = options.delta || 5 // Default expansion is 5 if not specified

  const lineSegments = vectorText({ x: 0, y: 0, input: char, height: CUBE_SIZE/2.5 })
  const shapes = []
  
  lineSegments.forEach((segment) => {
    let p = path2.fromPoints({}, segment)
    // Use the dynamic delta passed in options
    let expanded = expand({ delta: delta, corners: 'round' }, p)
    let extruded = extrudeLinear({ height: TEXT_THICKNESS }, expanded)
    
    // Only rotate if we are NOT making a flat insert/plate
    if (!isFlat) {
        extruded = rotateX(Math.PI / 2, extruded)
    }
    
    shapes.push(extruded)
  })

  return union(shapes)
}

module.exports = { main }