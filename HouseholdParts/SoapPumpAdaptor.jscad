function main () {
  shape = cylinder({r:18,h:28});
//  shape = union(shape, cylinder({r:35,}))
  shape = difference(shape,
          cylinder({r:13.5, h:30}))
  return shape;
}
