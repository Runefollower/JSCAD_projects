function main () {
    return union(
      cube({size: [30,60,5], center: [-15,-30,0]}),
      cylinder({r: 4, h:10}).translate([1,0,0]));
}
