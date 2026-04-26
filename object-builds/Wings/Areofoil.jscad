// https://en.wikipedia.org/wiki/NACA_airfoil

//Symmetrical 4 Digit NACA arirfoil per link above
function yt(x, t) {
  return 5*t*(
    0.2969*Math.sqrt(x) -
    0.1260*x -
    0.3516*x*x +
    0.2843*x*x*x -
    0.1015*x*x*x*x);
}

function flatWing (len, t) {
  areofoilPoints=[[0,0]];
  stepIncrement=0.01;
  for(xi=stepIncrement; xi<=1; xi+=stepIncrement) {
    areofoilPoints.push([xi,yt(xi,t)]);
  }
  for(xi=1-stepIncrement; xi>0; xi-=stepIncrement) {
    areofoilPoints.push([xi,-1*yt(xi,t)]);
  }

  areofoilCrossSection = polygon(areofoilPoints);
  extrudeWing = linear_extrude({height:len}, areofoilCrossSection);
  return extrudeWing.rotateX(90);
}

function isometricGrid(gridLen, minX, maxX, minY, maxY, gap) {
  // Will be generating an isometric grid moving along x axis first
  // x and y points are at the center of each triangle
  //
  // .      ...      .
  //   .           .   .
  //     . xa,yb . xb,yb .
  //       .   .           .
  //         .      ...      .
  //       .   .           .
  //     . xa,ya . xb,ya .
  //   .           .   .
  // .      ...      .
  var xa, xb;
  var ya, yb;

  // gridLen - len of one side of equilateral triangle
  // halfGridLen - half of above, used to calc point positions
  // xGridStep - increment in x axis for each block of triangles
  // yGridStep - increment in y axis
  var halfGridLen = gridLen/2;
  var gridHeight = halfGridLen * Math.sqrt(3);
  var xGridStep = gridLen;
  var yGridStep = gridHeight*2;

  var triangleSide = gridLen - gap;
  var halfTriangleWidth = triangleSide/2;
  var halfTriangleHeight = ((halfTriangleWidth) * Math.sqrt(3))/2;
  triangleA = polygon([
      [-1*halfTriangleWidth,-1*halfTriangleHeight],
      [   halfTriangleWidth,-1*halfTriangleHeight],
      [                   0,   halfTriangleHeight]]);
  triangleB = polygon([
      [                   0,-1*halfTriangleHeight],
      [   halfTriangleWidth,   halfTriangleHeight],
      [-1*halfTriangleWidth,   halfTriangleHeight]]);

  grid=null;

  for (xa = minX; xa < maxX; xa += xGridStep) {
    for (ya = minY; ya < maxY; ya += yGridStep) {
      console.log("xa: "+xa+" ya:"+ya);
      xb = xa+gridLen/2;
      yb = ya+gridHeight;

      if (grid === null) {
        grid = linear_extrude({hight:1},
          triangleA).translate([xa, ya, -0.5])
      } else {
        grid=union(grid,
          linear_extrude({hight:1},
            triangleA).translate([xa, ya, -0.5]));
      }

      grid=union(grid,
        linear_extrude({hight:1},
        triangleB).translate([xb, ya, -0.5]));

      grid=union(grid,
        linear_extrude({hight:1},
        triangleB).translate([xa, yb, -0.5]));
      grid=union(grid,
        linear_extrude({hight:1},
        triangleA).translate([xb, yb, -0.5]));
    }
  }

  //trim the grid
  trimRegion = cube({size:[maxX-minX,maxY-minY,1]}).translate([minX,minY,-0.5]);

  grid = intersection(grid,trimRegion);

  return grid;
}


function main() {
  finalLen = 12;
  finalWidth = 4;

  hollowWing=difference(flatWing(finalLen/finalWidth,0.15),
                        scale(.8,flatWing(2*(finalLen/finalWidth),0.10)).translate([0.1, .1, 0]));
  hollowWing = scale(finalWidth,hollowWing);

  drill = rotate([0,0,-90],isometricGrid(1.1, 0, 11, 0, 3, .2)).translate([0.5,-0.5,0]);
  gridWing = difference(hollowWing, drill);
  //gridWing = union(hollowWing, drill);

  gridWing = union(gridWing, cube({size:[1,0.5,.4]}).translate([0.5,-0.5,-0.2]) );
  gridWing = union(gridWing, cube({size:[1,0.3,.4]}).translate([0.5,-6.15,-0.2]) );
  gridWing = union(gridWing, cube({size:[1,0.5,.4]}).translate([0.5,-12,-0.2]) );

  return scale(10,gridWing);
}
