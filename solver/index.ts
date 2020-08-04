import { Record, List, is } from "immutable";
import seedrandom from "seedrandom";

// zachpwn zachpwn2 zachpwn3
const rng = seedrandom("zachpwn");


class Tuple<T extends any[]> {
    private list: List<any>;
    constructor(list: List<any>) {
        this.list = list;
    }

    get<I extends number>(i: I): T[I] {
        return this.list.get(i);
    }

    set<I extends number>(i: I, data: T[I]) {
        return new Tuple(this.list.set(i, data));
    }

    public static is<T extends any[]>(first: Tuple<T>, second: Tuple<T>) {
        return is(first.list, second.list);
    }

    public static of<T extends any[]>(list: T): Tuple<T> {
        return new Tuple(List(list));
    }
}

type Tile = "empty" | "red" | "blue" | "green";

type GameState = {
    width: number;
    height: number;
    // w + 1 by h
    verticalSegments: List<List<boolean>>;
    // w by h + 1
    horizontalSegments: List<List<boolean>>;
    // w + 1 by h + 1
    nodes: List<List<boolean>>;
    // y, x
    cursor: Tuple<[number, number]>;
    board: List<List<Tile>>

    prevGame: Record<GameState> | null;
}

const GameState: Record.Factory<GameState> = Record({
    width: 0,
    height: 0,
    verticalSegments: List(),
    horizontalSegments: List(),
    nodes: List(),
    cursor: Tuple.of([0, 0]),
    board: List(),
    prevGame: null as Record<GameState> | null,
});

namespace Automata {
    let aggregate = (counts: (Tile | null)[]) => {
        let base: { [T in Tile]: number} = { "empty": 0, "red": 0, "blue": 0, "green": 0 };
        counts.forEach((t) => t !== null && base[t]++);
        return base;
    }

    let cnt = (counts: (Tile | null)[], color: Tile | null) => {
        return counts.reduce((agg, t) => agg + (t === color ? 1 : 0), 0);
    }

    let most = (counts: (Tile | null)[]): Tile  => {
        let agg = aggregate(counts);
        let { red, blue, green } = agg;
        if (red === 0 && blue === 0 && green === 0) return "empty";
        if (red >= blue && red >= green) return "red";
        if (blue >= green) return "blue";
        return "green";
    }

    let fewest = (counts: (Tile | null)[]): Tile => {
        let agg = aggregate(counts);
        let { red, blue, green } = agg;
        if (red === 0 && blue === 0 && green === 0) return "empty";
        if (red <= blue && red <= green) return "red";
        if (blue <= green) return "blue";
        return "green";
    }

    let rules: { [T in Tile]: (adj: (Tile | null)[]) => Tile } = {
        "empty": (adj) => {
            let noRed = adj.filter((x) => x !== "red");
            if (noRed.length === 0) return "empty";
            return most(noRed);
        },
        "red": (adj) => {
            let numRed = cnt(adj, "red");
            let numBlue = cnt(adj, "blue");
            let numGreen = cnt(adj, "green");
            if (numRed !== 2 && numRed !== 3) {
                return "empty";
            }
            if (numBlue === 0 || numGreen === 0) {
                return "empty";
            }
            return "red";
        },
        "blue": (adj) => {
            let numRed = cnt(adj, "red");
            let numBlue = cnt(adj, "blue");
            let numGreen = cnt(adj, "green");
            if (numRed > 4) {
                return "empty";
            }
            if (numGreen > 4) {
                return "green";
            }
            if (numRed === 2 || numRed === 3) {
                return "red";
            }

            return "blue";
        },
        "green": (adj) => {
            let numRed = cnt(adj, "red");
            let numBlue = cnt(adj, "blue");
            let numGreen = cnt(adj, "green");
            if (numRed > 4) {
                return "empty";
            }
            if (numBlue > 4) {
                return "blue";
            }
            if (numRed === 2 || numRed === 3) {
                return "red";
            }

            return "green";
        },
    };

    export let createGame = (size: number, prob: number) => {
        return List(Array.from(new Array(size), (i) =>
            List(Array.from(new Array(size), (j) => {
                if (rng() < prob) {
                    return (["red", "green", "blue"] as Tile[])[Math.floor(rng() * 3)];
                }
                return "empty";
            }))
        ))
    };

    let adjacent = (board: List<List<Tile>>, i: number, j: number) => {
        let tiles = [
            [i-1, j-1],
            [i-1, j],
            [i-1, j+1],
            [i, j-1],
            [i, j+1],
            [i+1, j-1],
            [i+1, j],
            [i+1, j+1],
        ] as [number, number][];
        return tiles
            .map(([x, y]) =>
                x >= 0 && y >= 0 && y < board.size && x < board.get(0)!.size
                    ? board.get(y)!.get(x)!
                    : null
            );
    };

    export let step = (board: List<List<Tile>>) => {
        return board.map((row, j) => row.map((col, i) =>
            rules[col](adjacent(board, i, j))
        ));
    };
}

namespace Solver {
    let makeGrid = <T>(height: number, width: number, dflt: (y: number, x: number) => T): List<List<T>> =>
        List(Array.from(new Array(height), (_, y) => List(Array.from(new Array(width), (_, x) => dflt(y, x)))));

    let twoDSet = <T>(grid: List<List<T>>, y: number, x: number, value: T) =>
        grid.set(y, grid.get(y)!.set(x, value));

    let bulkSet = <T>(grid: List<List<T>>, ops: [number, number, T][]) => {
        for (let [y, x, value] of ops) {
            grid = twoDSet(grid, y, x, value);
        }
        return grid;
    }

    export let newGame = (width: number): Record<GameState> => {

        return GameState({
            width: width,
            height: width,
            board: bulkSet(Automata.createGame(width, 0.75), [
                [0, 0, "red"],
                //[0, 1, "blue"],
                //[1, 0, "green"],
            ]),
            horizontalSegments: makeGrid(width + 1, width, () => false),
            verticalSegments: makeGrid(width, width + 1, () => false),
            nodes: makeGrid(width + 1, width + 1, (x, y) => x !== 0 || y !== 0),
            cursor: Tuple.of([0, 0]),
        });
    }

    export let fromSeed = (seed: string): Record<GameState> => {
        const width = Math.floor(Math.sqrt(seed.length));
        let game = newGame(width);
        return game.set("board", game.get("board").map((row, i) => row.map((_, j): Tile => {
            switch(seed[i * width + j]) {
                case " ":
                    return "empty"
                case "r":
                    return "red"
                case "g":
                    return "green"
                case "b":
                    return "blue"
                default:
                    throw new Error("Bad seed string")
            }
        })))
    }

    let steps = (game: Record<GameState>) => {
        let y = game.get("cursor").get(0);
        let x = game.get("cursor").get(1);

        let allowed = (y: number, x: number) => y >= 0 && x >= 0 && y <= game.get("height") && x <= game.get("width");

        let available = (y: number, x: number) => game.get("nodes").get(y)?.get(x) ?? false;
        let hasRed = (y1: number, x1: number, y2: number, x2: number) => {
            if (x1 === x2) {
                let boardY = Math.min(y1, y2);
                return (
                    (allowed(boardY, x1 - 1) && game.get("board").get(boardY)?.get(x1 - 1) === "red")
                    || (allowed(boardY, x1) && game.get("board").get(boardY)?.get(x1) === "red")
                );
            } else if (y1 === y2) {
                let boardX = Math.min(x1, x2);
                return (
                    (allowed(y1 - 1, boardX) && game.get("board").get(y1 - 1)?.get(boardX) === "red")
                    || (allowed(y1, boardX) && game.get("board").get(y1)?.get(boardX) === "red")
                );
            }
            throw new Error("Bad state");
        }

        let addEdge = (y1: number, x1: number, y2: number, x2: number) => {
            let updatedGame: Record<GameState>;
            if (x1 === x2) {
                updatedGame = game.set("verticalSegments", twoDSet(game.get("verticalSegments"), Math.min(y1, y2), x1, true));
            } else if (y1 === y2) {
                updatedGame = game.set("horizontalSegments", twoDSet(game.get("horizontalSegments"), y1, Math.min(x1, x2), true));
            } else {
                throw new Error("Bad state");
            }

            return (
                updatedGame
                    .set("nodes", twoDSet(game.get("nodes"), y2, x2, false))
                    .set("cursor", Tuple.of([y2, x2]))
                    .set("prevGame", game)
            );
        }

        let dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        let nextSteps: Record<GameState>[] = []
        for (let [dy, dx] of dirs) {
            if (allowed(y + dy, x + dx) && available(y + dy, x + dx) && hasRed(y, x, y + dy, x + dx)) {
                nextSteps.push(addEdge(y, x, y + dy, x + dx));
            }
        }

        return nextSteps.map((game) => game.set("board", Automata.step(game.get("board"))));
    }

    export let solve = (game: Record<GameState>, print = false) => {
        // just do bfs
        let queue = [game];
        let successful: Record<GameState>[] = [];
        let target = Tuple.of([game.get("height"), game.get("width")]);
        while (queue.length !== 0) {
            if (queue.length > 50) {
                console.log("State Explosion! Stopping to prevent damage");
                drawHistory(queue.pop()!);
                process.exit(0);
                return [];
            }

            let candidate = queue.pop()!;
            if (print) {
                drawGame(candidate);
            }

            if (Tuple.is(candidate.get("cursor"), target)) {
                successful.push(candidate);
            }

            let next = steps(candidate);

            queue.push(...next);
        }

        return successful;
    }

    export let drawGame = (game: Record<GameState>) => {
        const red = "\x1b[38;5;1m";
        const green = "\x1b[38;5;2m";
        const yellow = "\x1b[38;5;3m";
        const blue = "\x1b[38;5;4m";
        const gray = "\x1b[38;5;8m";
        const clear = "\x1b[0m";

        //process.stdout.write("\x1b[2J");
        process.stdout.write("\n\n\n");

        let drawNode = (y: number, x: number) => {
            if (!game.get("nodes").get(y)?.get(x)) {
                process.stdout.write(yellow + "░░" + clear)
            } else {
                process.stdout.write(gray + "██" + clear);
            }
        }

        let drawHS = (y: number) => {
            for (let x = 0; x < game.get("width"); x ++) {
                drawNode(y, x);

                if (game.get("horizontalSegments").get(y)?.get(x)) {
                    process.stdout.write(yellow + "━━" + clear)
                } else {
                    process.stdout.write(gray + "██" + clear);
                }
            }

            drawNode(y, game.get("width"));
            process.stdout.write("\n");
        }

        let drawVS = (y: number, x: number) => {
            if (game.get("verticalSegments").get(y)?.get(x)) {
                process.stdout.write(yellow + "▐▌" + clear);
            }  else {
                process.stdout.write(gray + "██" + clear);
            }
        }

        let drawRow = (y: number) => {
            for (let x = 0; x < game.get("width"); x++ ) {
                drawVS(y, x);

                let tile = game.get("board").get(y)!.get(x)!;
                switch (tile) {
                    case "red": process.stdout.write(red); break;
                    case "green": process.stdout.write(green); break;
                    case "blue": process.stdout.write(blue); break;
                    case "empty": process.stdout.write(gray); break;
                }
                process.stdout.write("██");
                process.stdout.write(clear);
            }

            drawVS(y, game.get("width"));
            process.stdout.write("\n");
        }

        for (let y = 0; y < game.get("height"); y++) {
            drawHS(y);
            drawRow(y);
        }

        drawHS(game.get("height"));
    }

    export let drawHistory = (game: Record<GameState> | null) => {
        if (game === null) {
            return;
        }

        drawGame(game);
        drawHistory(game.get("prevGame"));
    }

    export let drawSolution = (game: Record<GameState> | null) => {
        if (game === null) {
            return;
        }

        drawSolution(game.get("prevGame"));
        drawGame(game);
    }

    export let getPathLen = (game: Record<GameState>) => {
        let currGame = game;
        let count = 1;
        while (currGame.get("prevGame") !== null) {
            count++;
            currGame = currGame.get("prevGame")!;
        }
        return count;
    }

    export let getSeed = (game: Record<GameState>): string => {
        if (game.get("prevGame") === null) {
            return game.get("board").flatMap((row) => row.map((tile) =>
                tile === "empty" ? " " :
                tile === "red" ? "r" :
                tile === "green" ? "g" :
                "b"
            )).join("");
        }

        return getSeed(game.get("prevGame")!);
    }
}

const seeds = [
    "rbrr rgb rb  r brgrbrgb  grrgbbg grg bgrg  bbgrbg", // puzzle 1
    "rbr  bbggrgrggb   bggbb b  b bbrbbgg gbrrbgrbbb g", // puzzle 2
    "rrbrb rg g  bgrbgggr ggrgr gr rg brr  b  bggrbgbb", // puzzle 3
]

for (const seed of seeds) {
    const game = Solver.fromSeed(seed);
    const solution = Solver.solve(game, false);
    console.log(`Solution for seed (${seed}):`);
    Solver.drawSolution(solution[0]);
    console.log("\n\n\n");
}