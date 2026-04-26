function main () {
  shape = cylinder({r:18,h:28});
//  shape = union(shape, cylinder({r:35,}))
  shape = difference(shape,
          cylinder({r:14, h:30}));
  shape = difference(shape,
          cylinder({r:15.5, h:10}).translate([0,0,20]));
  return shape;
}
