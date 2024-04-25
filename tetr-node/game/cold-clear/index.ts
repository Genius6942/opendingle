import { spawn } from "node:child_process";
import {
  BoardCell,
  Message,
  Piece,
  ReadyMessage,
  SuggestionMessage,
  SysErrorMessage,
  fallbackEmitter,
} from "./types";
import { EventEmitter } from "node:events";
import path from "node:path";
import chalk from "chalk";
import { platform } from "node:os";
import { log } from "../utils/log";

/**
 * ColdClear is a wrapper for the Cold Clear bot via the cli.
 */
export default class ColdClear {
  thread: import("child_process").ChildProcessWithoutNullStreams;
  events: fallbackEmitter<{
    error: string;
    suggestion: SuggestionMessage;
    ready: ReadyMessage;
    syserror: SysErrorMessage;
  }>;
  ended: boolean;
  constructor() {
    this.thread = spawn(
      path.join(
        __dirname,
        `${platform() === "win32" ? "bin-windows" : "bin-linux"}/cold-clear-2`,
      ),
    );
    this.thread.stderr.on("data", (data) => log(data.toString()));
    this.thread.on(
      "close",
      (code) => code && log(`child process exited with code ${code}`),
    );
    this.thread.stdout.on("data", (data) => this.handleData(data));

    this.events = new EventEmitter();

    this.ended = false;
  }

  sendMessage(message: Message) {
    if (this.ended)
      return console.warn(
        "[Cold Clear] Warning: tried to send message to ended thread. Create new instance to restart.",
      );
    // log("send", JSON.stringify(message));
    this.thread.stdin.write(JSON.stringify(message) + "\n");
  }

  handleData(rawData: string | Buffer) {
    // log("recieve", JSON.stringify(data));
    const data: Message[] = [];

    const text = rawData.toString().trim();

    try {
      data.push(JSON.parse(text));
    } catch {
      text.split("\n").forEach((item) => {
        if (item.trim() === "") return;
        try {
          data.push(JSON.parse(item.trim()));
        } catch {
          console.error(
            "Failed to parse json: ",
            item.toString(),
            "raw:",
            rawData,
          );
          this.sendMessage({
            type: "syserror",
            reason: "badjson",
            msg: "Json sent by cold-clear stdout thread invalid",
          });
        }
      });
    }

    data.forEach((data) => {
      switch (data.type) {
        case "info": {
          this.sendMessage({ type: "rules", randomizer: "seven_bag" });
          break;
        }

        case "error": {
          this.events.emit("error", data.reason);
          break;
        }

        default: {
          this.events.emit(data.type, data);
        }
      }
    });
  }

  start({
    hold = null,
    queue,
    combo = 0,
    backToBack = false,
    board = Array(40)
      .fill([])
      .map(() => Array(10).fill(null)),
  }: {
    hold?: Piece | null;
    queue: Piece[];
    combo?: number;
    backToBack?: boolean;
    board?: BoardCell[][];
  }) {
    this.sendMessage({
      type: "start",
      hold,
      queue,
      combo,
      back_to_back: backToBack,
      board,
    });
  }

  generateKeys(
    location: [number, number],
    rotation: number,
    spin: "none" | "mini" | "full",
    spinFrom?: "left" | "right",
  ) {
    const keys: string[] = [];
    const spawnX = 4;
    if (spin === "none") {
      // rotation
      for (let i = 0; i < rotation; i++) {
        keys.push("rotate");
      }

      // translation
      if (location[0] < spawnX) {
        for (let i = 0; i < spawnX - location[0]; i++) {
          keys.push("left");
        }
      } else {
        for (let i = 0; i < location[0] - spawnX; i++) {
          keys.push("right");
        }
      }
    } else {
      // rotation
      keys.push(spinFrom === "left" ? "rotateccw" : "rotate");
      // translation
      if (location[0] < spawnX) {
        for (let i = 0; i < spawnX - location[0]; i++) {
          keys.push("left");
        }
      } else {
        for (let i = 0; i < location[0] - spawnX; i++) {
          keys.push("right");
        }
      }

      // keys.push("soft");
      for (let i = 0; i < 30; i++) {
        keys.push("soft");
      }

      // spin part
      if (spinFrom === "left") {
        switch (rotation) {
          case 0:
            keys.push("rotate");
            break;
          case 1:
            keys.push("rotate", "rotate");
            break;
          case 2:
            keys.push("rotateccw");
            break;
          case 3:
            break;
          default:
            break;
        }
      } else {
        switch (rotation) {
          case 0:
            keys.push("rotateccw");
            break;
          case 3:
            keys.push("rotateccw", "rotateccw");
            break;
          case 2:
            keys.push("rotate");
            break;
          case 1:
            break;
          default:
            break;
        }
      }
    }

    keys.push("hard");

    return keys;
  }

  getSingleSuggestion(): Promise<SuggestionMessage["moves"][0] | null> {
    return new Promise((resolve, reject) => {
      this.sendMessage({ type: "suggest" });
      const sysErrorListener = (data: SysErrorMessage) => {
        this.events.off("suggestion", suggestionListener);
        reject(data.reason);
      };
      const suggestionListener = (data: SuggestionMessage) => {
        const moves = data.moves;
        // log(data);
        this.events.off("syserror", sysErrorListener);
        resolve(moves[0] || null);
      };
      this.events.once("suggestion", suggestionListener);
      this.events.once("syserror", sysErrorListener);
    });
  }

  async suggest(): Promise<SuggestionMessage["moves"][0]> {
    const moveFailCap = 100;
    let moveFailCount = 0;
    while (moveFailCount < moveFailCap) {
      try {
        const move = await this.getSingleSuggestion();
        if (move) {
          this.sendMessage({ type: "play", move });
          return move;
        }
        moveFailCount++;
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
    log("mega rip (no moves found after", moveFailCap, "tries");
    throw new Error("no moves");
  }

  addPieces(...pieces: Piece[]) {
    pieces.forEach((piece) => {
      this.sendMessage({ type: "new_piece", piece });
    });
  }

  static pieces = {
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

  static colorMap = {
    I: chalk.bgCyan,
    J: chalk.bgBlue,
    L: chalk.bgYellow,
    O: chalk.bgWhite,
    S: chalk.bgGreenBright,
    T: chalk.bgMagentaBright,
    Z: chalk.bgRedBright,
    G: chalk.bgGray,
  };

  printBoard(board: any[][], full = false) {
    board
      .filter(
        (row) => row.filter((item) => (full ? true : item !== null)).length > 0,
      )
      // .reverse()
      .forEach((row) => {
        log(
          row
            .map((cell) =>
              cell ? ColdClear.colorMap[cell as Piece]("  ") : "  ",
            )
            .join(""),
        );
      });
  }

  printBoardRaw(board: any[][], full = false) {
    log(
      board.filter(
        (row) => row.filter((item) => (full ? true : item !== null)).length > 0,
      ),
    );
  }

  rotationFromDirection = (direction: "north" | "east" | "south" | "west") => {
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

  rotate = (piece: Piece, rotation: number) => {
    if (piece === "I") {
      return ColdClear.pieces[piece][rotation % 4];
    } else {
      let actualPiece = ColdClear.pieces[piece];
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

  stop() {
    this.sendMessage({ type: "stop" });
  }

  quit() {
    try {
      this.sendMessage({ type: "quit" });
      this.thread.kill();
      this.ended = true;
    } catch (e) {}
  }
}
