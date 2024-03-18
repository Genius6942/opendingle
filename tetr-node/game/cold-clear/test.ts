import ColdClear from ".";
import { Piece } from "./types";
import { bag7 } from "../utils/rng";
import chalk from "chalk";

const bot = new ColdClear();

const pieces = {
  I: [
    [
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [0, 0],
      [0, -1],
      [0, -2],
    ],
    [
      [-2, 0],
      [-1, 0],
      [0, 0],
      [1, 0],
    ],
    [
      [0, 2],
      [0, 1],
      [0, 0],
      [0, -1],
    ],
  ],
  J: [
    [-1, 1],
    [-1, 0],
    [0, 0],
    [1, 0],
  ],
  L: [
    [-1, 0],
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  O: [
    [0, 1],
    [0, 0],
    [1, 1],
    [1, 0],
  ],
  S: [
    [-1, 0],
    [0, 0],
    [0, 1],
    [1, 1],
  ],

  T: [
    [-1, 0],
    [0, 0],
    [1, 0],
    [0, 1],
  ],
  Z: [
    [-1, 1],
    [0, 1],
    [0, 0],
    [1, 0],
  ],
};

const colorMap = {
  I: chalk.bgCyan,
  J: chalk.bgBlue,
  L: chalk.bgYellow,
  O: chalk.bgWhite,
  S: chalk.bgGreenBright,
  T: chalk.bgMagentaBright,
  Z: chalk.bgRedBright,
};

const printBoard = (board: any[][]) => {
  board
    .filter((row) => row.filter((item) => item !== null).length > 0)
    // .reverse()
    .forEach((row) => {
      console.log(
        row
          .map((cell) =>
            cell ? colorMap[cell as Piece]("  ") : chalk.bgBlack("  "),
          )
          .join(""),
      );
    });
};

const rotationFromDirection = (
  direction: "north" | "east" | "south" | "west",
) => {
  switch (direction) {
    case "north":
      return 0;
    case "east":
      return 1;
    case "south":
      return 2;
    case "west":
      return 3;
  }
};

const rotate = (piece: Piece, rotation: number) => {
  if (piece === "I") {
    return pieces[piece][rotation % 4];
  } else {
    let actualPiece = pieces[piece];
    for (let i = 0; i < rotation % 4; i++) {
      actualPiece = actualPiece.map((block: any) => {
        const blockCopy = [...block];
        [blockCopy[0], blockCopy[1]] = [blockCopy[1], blockCopy[0]];
        blockCopy[1] = -blockCopy[1];
        return blockCopy;
      });
    }

    return actualPiece;
  }
};

bot.events.on("error", (error) => {
  console.log(error);
});

bot.events.on("ready", async () => {
  const rng = bag7(1883157);
  const queue: Piece[] = [
    ...rng(),
    ...rng(),
    ...rng(),
    ...rng(),
    ...rng(),
    ...rng(),
    ...rng(),
    ...rng(),
    ...rng(),
    ...rng(),
  ] as any;
  let hold: string | null = null;
  const doHold = () => {
    // console.log(hold, queue)
    if (!hold) {
      hold = queue.shift() as any;
    } else {
      queue.splice(1, 0, hold as any);
      hold = queue.shift() as any;
    }
    // console.log(hold, queue)
  };
  const getSpinDirection = (location: [number, number]) => {
    if (board[39 - location[1] - 1][location[0] + 1]) {
      return "left";
    }

    return "right";
  };
  const board = Array(40)
    .fill([])
    .map(() => Array(10).fill(null));

  bot.start({ queue, board });

  for (let i = 0; i < 15; i++) {
    try {
      const move = await bot.suggest();
      const location = move.location;
      move.spin !== "none" && console.log(move.spin);
      rotate(
        location.type as Piece,
        rotationFromDirection(location.orientation),
      ).forEach((block) => {
        board[39 - location.y - block[1]][location.x + block[0]] =
          location.type;
      });
      console.log("-------------------");
      printBoard(board);
      [...board].reverse().forEach((row) => {
        if (row.filter((item) => item === null).length === 0) {
          board.splice(board.indexOf(row), 1);
          board.unshift(Array(10).fill(null));
        }
      });
      const moves: string[] = [];
      if (location.type !== queue[0]) {
        console.log(location.type, queue[0]);
        doHold();
        moves.push("hold");
      }
      queue.shift();
      moves.push(
        ...bot.generateKeys(
          [move.location.x, move.location.y],
          bot.rotationFromDirection(move.location.orientation),
          move.spin,
          move.spin !== "none"
            ? getSpinDirection([move.location.x, move.location.y])
            : undefined,
        ),
      );

      console.log(moves.join(", "));
    } catch (e) {
      // console.error(e);
      // try {
      //   const move = await bot.suggest();
      //   console.log(move);
      // } catch {
      //   try {
      //     const move = await bot.suggest();
      //     console.log(move);
      //   } catch {
      //     console.error("no moves LL");
      //   }
      // }
    }
  }

  console.log("done");
  // console.log([...board].reverse().map((row) => row.map((cell) => cell ? 'X' : ' ').join(" ")).join("\n"));
  printBoard(board);

  bot.stop();
  bot.quit();
});
