function addCube(r,t) {
  return cube({size:[8,8,8],center:[-4,-4,-4]})
    .rotateY(t)
    .translate([0,8,0])
    .rotateZ(r);
}

function main () {
  shape=cube();
  steps=8;
  increment=360/steps;

  for(i=0; i<steps; i+=1) {
    shape = union(shape,addCube(i*increment,i*increment));
  }

  return shape;
}
