function createLink(width, height, barThickness) {
  // Create the main oval (elliptical) shape
  const mainOval = scale(
    [width / 2, height / 2, 1],
    CAG.circle({ center: [0, 0], radius: 1 })
  );

  // Cutout for the inner oval to make it hollow
  const innerOval = scale(
    [(0.7 * width) / 2, (0.7 * height) / 2, 1],
    CAG.circle({ center: [0, 0], radius: 1 })
  );

  // Subtracting inner oval from the main oval to get a hollow link
  const hollowLink2D = mainOval.subtract(innerOval);

  // Convert the 2D shape to 3D
  const hollowLink3D = hollowLink2D.extrude({ offset: [0, 0, barThickness] });

  // Create the bar shape through the middle
  const bar = CSG.cube({
    corner1: [-barThickness / 2, -height / 2, -barThickness / 2],
    corner2: [barThickness / 2, height / 2, barThickness / 2],
  });

  // Adjust the Z positioning of the bar to align it with the center of the extrusion
  const centeredBar = bar.translate([0, 0, barThickness / 2]);

  // Merging the bar with the hollow link
  return hollowLink3D.union(centeredBar);
}

function main(params) {
  return createLink(20, 10, 2);
}
