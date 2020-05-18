spacing = 10;
columns = 5;
rows = 3;
col_offset = ((columns - 1)/2)*spacing*-1
row_offset = ((rows - 1)/2)*spacing*-1

function main () {
    testShape = cube({size: [30,60,5], center: [-15,-30,0]});

    cylRadius=3.6
    for (c = 0; c < columns; c++) {
        for (r = 0; r < rows; r++) {
            testShape = union(testShape, cylinder({r: cylRadius, h: 10}).translate(
                [
                    row_offset+r*spacing,
                    col_offset+c*spacing,
                    0
                ]));
            cylRadius += .1
        }
    }

    holeRadius=0.5;
    for (c = 0; c < columns; c++) {
        for (r = 0; r < rows; r++) {
            testShape = difference(testShape, cylinder({r: holeRadius, h: 10}).translate(
                [
                    row_offset+r*spacing,
                    col_offset+c*spacing,
                    0
                ]));
            holeRadius += .1
        }
    }

    return testShape;
}
