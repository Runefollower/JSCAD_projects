function chainLink(outerRadius, tubeRadius, scaleFactor) {
  let resultShapes = [];

  resultShapes.push(scale([1, scaleFactor, 1], torus(outerRadius, tubeRadius)));

  //resultShapes.push(torus(outerRadius, tubeRadius));

  let result = resultShapes[0];
  for (let i = 1; i < resultShapes.length; i++) {
    result = result.union(resultShapes[i]);
  }

  return result;
}

function main(params) {
  let resultShapes = [];
  resultShapes.push(chainLink(20, 5, 2));
  return resultShapes;
}
