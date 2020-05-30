function addCube(r,t) {
  s=8;
  ccenter=-1*s/2;
  scut=4;
  sccenter=-1*scut/2;


  frame=cube({size:[s,s,s],center:[ccenter,ccenter,ccenter]});

  frame=difference(frame, cube({size:[scut,scut,s],center:[sccenter,sccenter,ccenter]}));
  frame=difference(frame, cube({size:[scut,s,scut],center:[sccenter,ccenter,sccenter]}));
  frame=difference(frame, cube({size:[s,scut,scut],center:[ccenter,sccenter,sccenter]}));

  return frame
    .rotateY(t)
    .translate([0,8,0])
    .rotateZ(r);
}

function main () {
  shape=null;
  steps=8;
  increment=360/steps;

  for(i=0; i<steps; i+=1) {
    newShape = addCube(i*increment,i*increment);
    if (i==0) {
      shape = newShape;
    } else {
      shape = union(shape,newShape);
    }
  }

  return shape;
}
