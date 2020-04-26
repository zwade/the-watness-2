import { List, Record } from "immutable";

/**
 * Combinatorics are hard. If you find a closed expression that
 * solves this, please tell me so I can determine exactly
 * how dumb I really am.
 */


/**
 * Results:
 *
 *  2 - 2
 *  3 - 6
 *  4 - 12
 *  5 - 184
 *  6 - 2952
 *  7 - 257472
 *  8 - 6765096
 */

const size = 4;

const startNodes = List(Array.from(new Array(size), (_, y) =>
    List(Array.from(new Array(size), (_, x) =>
        x === 0 && y === 0 ? true : false
    ))
));

const SimState = Record({
    x: 0,
    y: 0,
    endX: size - 1,
    endY: size - 1,
    nodes: startNodes
});

const startState = SimState();

let stack = [startState];
let count = 0;

while (stack.length > 0) {
    let next = stack.pop()!;
    if (next.x === next.endX && next.y === next.endY) {
        count++;
        if (count % 1000 === 0) {
            console.log(count)
        }
        continue;
    }

    for (let [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let x = next.x + dx;
        let y = next.y + dy;
        if (x < 0 || x >= size || y < 0 || y >= size || next.nodes.get(y)!.get(x)) {
            continue;
        }

        next = next.set("nodes", next.nodes.set(y, next.nodes.get(y)!.set(x, true)));
        next = next.set("x", x);
        next = next.set("y", y);

        stack.push(next);
    }
}

console.log(count);

