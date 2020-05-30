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


function isometricDrill1(target, gridLen, minX, maxX, minY, maxY, gap) {
  // Will be generating an isometric grid moving along x axis first
  //   xa,yc   ..   xc,yc
  //       .       .     .
  //        .     .       .
  //         xb,yb   ..   xd,yb
  //        .     .       .
  //       .   xa    .     .
  //   xa,ya   ..   xc,ya
  var xa, xb, xc, xd;
  var ya, yb, yc;

  // gridLen - len of one side of equilateral triangle
  // halfGridLen - half of above, used to calc point positions
  // xGridStep - increment in x axis for each block of triangles
  // yGridStep - increment in y axis
  var halfGridLen = gridLen/2;
  var gridHeight = halfGridLen * Math.sqrt(3);
  var xGridStep = gridLen*1.5;
  var yGridStep = gridHeight*2;

  for (xa = minX; xa < (maxX-xGridStep); xa += xGridStep) {
    for (ya = minY; ya < (maxY-yGridStep); ya += yGridStep) {
      xb = xa+halfGridLen;
      xc = xa+gridLen;
      xd = xb+gridLen;
      yb = ya+gridHeight;
      yc = yb+gridHeight;

      target=difference(target,
           linear_extrude({hight:1},polygon([
               [xa,ya],
               [xc,ya],
               [xb,yb]])).translate([0, 0, -0.5]));

      target=difference(target,
            linear_extrude({hight:1},polygon([
                [xa,yb],
                [xc,yb],
                [xb,yc]])).translate([0, 0, -0.5]));
    }
  }
}

function isometricDrill(target, gridLen, minX, maxX, minY, maxY, gap) {
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
  var halfTriangleWidth = triangleSide/2
  var halfTriangleHeight = ((halfTriangleWidth) * Math.sqrt(3))/2;
  triangleA = polygon([
      [-1*halfTriangleWidth,-1*halfTriangleHeight],
      [   halfTriangleWidth,-1*halfTriangleHeight],
      [                   0,   halfTriangleHeight]]);
  triangleB = polygon([
      [                   0,-1*halfTriangleHeight],
      [   halfTriangleWidth,   halfTriangleHeight],
      [-1*halfTriangleWidth,   halfTriangleHeight]]);

  drill=null;

  for (xa = minX; xa < maxX; xa += xGridStep) {
    for (ya = minY; ya < maxY; ya += yGridStep) {
      console.log("xa: "+xa+" ya:"+ya);
      xb = xa+gridLen/2;
      yb = ya+gridHeight;

/*
      target=difference(target,
        linear_extrude({hight:1},
        triangleA.translate([xa, ya, -0.5])));
      target=difference(target,
        linear_extrude({hight:1},
        triangleB.translate([xb, ya, -0.5])));

      target=difference(target,
        linear_extrude({hight:1},
        triangleB.translate([xa, yb, -0.5])));
      target=difference(target,
        linear_extrude({hight:1},
        triangleA.translate([xb, yb, -0.5])));
*/

      if (drill == null) {
        drill = linear_extrude({hight:1},
          triangleA).translate([xa, ya, -0.5])
      } else {
        drill=union(drill,
          linear_extrude({hight:1},
            triangleA).translate([xa, ya, -0.5]));
      }

      drill=union(drill,
        linear_extrude({hight:1},
        triangleB).translate([xb, ya, -0.5]));

      drill=union(drill,
        linear_extrude({hight:1},
        triangleB).translate([xa, yb, -0.5]));
      drill=union(drill,
        linear_extrude({hight:1},
        triangleA).translate([xb, yb, -0.5]));
    }
  }

  //trim the drill
  //drill = union(cube({size:[maxX-min]}),drill);

  return difference(target, drill);
  //return drill;
}


function main() {
  hollowWing=difference(flatWing(2,0.15),
                        scale(.8,flatWing(4,0.10)).translate([0.1, .1, 0]));

//  gridWing=difference(hollowWing,
//           linear_extrude({hight:1},polygon([[0.1,-0.1],[0.1,-0.2],[0.2,-0.15]])).translate([0, 0, -0.5]));

  gridWing = isometricDrill(hollowWing, .2, 0.2, .8, -1.8, 0.2, .03);

  return scale(10,gridWing);
}
