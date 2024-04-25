import { Queue, QueueInitializeParams } from "./queue";
import { Piece } from "./queue/types";
import { EngineCheckpoint, SpinType } from "./types";
import { Board, BoardInitializeParams } from "./board";
import { KickTable } from "./utils/kicks";
import { KickTableName, kicks } from "./utils/kicks/data";
import { Tetromino, tetrominoes } from "./utils/tetromino";
import { garbageCalcV2, garbageData } from "./utils/garbage";
import { bfs } from "./search";
import { Garbage, GarbageQueue, GarbageQueueInitializeParams } from "./garbage";
import { deepCopy } from "./utils";

export interface GameOptions {
  spinBonuses: string;
  comboTable: keyof (typeof garbageData)["comboTable"] | "multiplier";
  b2bChaining: boolean;
  garbageTargetBonus: "none" | "normal" | string;
  garbageMultiplier: {
    value: number;
    increase: number;
    marginTime: number;
  };

  garbageAttackCap?: number;
  garbageBlocking: "combo blocking" | "limited blocking" | "none";
}

export interface EngineInitializeParams {
  queue: QueueInitializeParams;
  board: BoardInitializeParams;
  kickTable: KickTable;
  options: GameOptions;
  garbage: GarbageQueueInitializeParams;
}

export class Engine {
  queue: Queue;
  held: Piece | null;
  falling: Tetromino;
  _kickTable: KickTableName;
  board: Board;
  lastSpin: {
    piece: Piece;
    type: SpinType;
  } | null;
  stats: {
    combo: number;
    b2b: number;
  };
  gameOptions: GameOptions;
  garbageQueue: GarbageQueue;

  frame: number;
  checkpoints: EngineCheckpoint[];

  constructor(options: EngineInitializeParams) {
    this.queue = new Queue(options.queue);

    this._kickTable = options.kickTable;

    this.board = new Board(options.board);

    this.garbageQueue = new GarbageQueue(options.garbage);

    this.nextPiece();
    this.held = null;
    this.lastSpin = null;

    this.stats = {
      combo: -1,
      b2b: -1,
    };

    this.gameOptions = options.options;

    this.frame = 0;

    this.checkpoints = [];
  }

  revert() {
    if (this.checkpoints.length === 0) throw new Error("No checkpoints to revert to");
    const checkpoint = this.checkpoints.at(-1);
    this.queue.reset(checkpoint.queue);
    this.board.state = deepCopy(checkpoint.board);
		this.stats.b2b = checkpoint.b2b;
		this.stats.combo = checkpoint.combo;
    this.initiatePiece(checkpoint.falling);
    this.garbageQueue.queue = deepCopy(checkpoint.garbage);
    this.checkpoints.pop();
  }

  checkpoint() {
    this.save();
  }

  save() {
    this.checkpoints.push({
      garbage: deepCopy(this.garbageQueue.queue),
      board: deepCopy(this.board.state),
      falling: this.falling.symbol,
      queue: this.queue.index,
			b2b: this.stats.b2b,
			combo: this.stats.combo,
    });
  }

  get kickTable(): (typeof kicks)[KickTableName] {
    return kicks[this._kickTable];
  }

  get kickTableName(): KickTableName {
    return this._kickTable;
  }

  set kickTable(value: KickTableName) {
    this._kickTable = value;
  }

  nextPiece() {
    const newTetromino = this.queue.shift()!;
    this.initiatePiece(newTetromino);
  }

  initiatePiece(piece: Piece) {
    this.falling = new Tetromino({
      boardHeight: this.board.height,
      boardWidth: this.board.width,
      initialRotation:
        piece.toLowerCase() in this.kickTable.spawn_rotation
          ? this.kickTable.spawn_rotation[piece.toLowerCase()]
          : 0,
      symbol: piece,
    });
  }

  isTSpinKick(kick: ReturnType<typeof Tetromino.prototype.rotate180>) {
    if (typeof kick === "object") {
      return (
        (kick.id === "03" && kick.index === 3) || (kick.id === "21" && kick.index === 3)
      );
    }

    return false;
  }

  rotateCW() {
    this.lastSpin = {
      piece: this.falling.symbol,
      type: this.detectSpin(
        this.isTSpinKick(this.falling.rotateCW(this.board.state, this.kickTableName))
      ),
    };
  }
  rotateCCW() {
    this.lastSpin = {
      piece: this.falling.symbol,
      type: this.detectSpin(
        this.isTSpinKick(this.falling.rotateCCW(this.board.state, this.kickTableName))
      ),
    };
  }
  rotate180() {
    this.lastSpin = {
      piece: this.falling.symbol,
      type: this.detectSpin(
        this.isTSpinKick(this.falling.rotate180(this.board.state, this.kickTableName))
      ),
    };
  }

  moveRight() {
    this.falling.moveRight(this.board.state);
  }

  moveLeft() {
    this.falling.moveLeft(this.board.state);
  }

  softDrop() {
    this.falling.softDrop(this.board.state);
  }

  detectSpin(finOrTst: boolean): SpinType {
    if (this.falling.symbol === "T") {
      return this.detectTSpin(finOrTst);
    }
    return "none";
  }

  detectTSpin(finOrTst: boolean): SpinType {
    if (this.falling.symbol !== "T") return "none";

    if (finOrTst) return "normal";

    const corners = this.getTCorners();

    if (corners.filter((item) => item).length < 3) return "none";

    const facingCorners: [boolean, boolean] = [
      corners[this.falling.rotation],
      corners[(this.falling.rotation + 1) % 4],
    ];

    if (facingCorners[0] && facingCorners[1]) {
      return "normal";
    }

    return "mini";
  }

  /**
   * Returns array of true/false corners in this form (numbers represent array indicies):
   * @example
   *  0    1
   *  🟦🟦🟦
   *  3 🟦 2
   */
  getTCorners() {
    const [x, y] = [this.falling.location[0] + 1, this.falling.location[1] - 1];
    const getLocation = (x: number, y: number) =>
      x < 0
        ? true
        : x >= this.board.width
        ? true
        : y < 0
        ? true
        : this.board.state[y][x] !== null;

    return [
      getLocation(x - 1, y + 1),
      getLocation(x + 1, y + 1),
      getLocation(x + 1, y - 1),
      getLocation(x - 1, y - 1),
    ];
  }

  hardDrop() {
    this.softDrop();

    this.board.add(
      ...(this.falling.blocks.map((block) => [
        this.falling.symbol,
        this.falling.location[0] + block[0],
        this.falling.location[1] - block[1],
      ]) as any)
    );

    const lines = this.board.clearLines();

    if (lines > 0) {
      this.stats.combo++;
      if ((this.lastSpin && this.lastSpin.type !== "none") || lines > 4) {
        this.stats.b2b++;
      } else this.stats.b2b = -1;
    } else {
      this.stats.combo = -1;
    }

    const res = {
      lines,
      spin: this.lastSpin ? this.lastSpin.type : "none",
      sent: garbageCalcV2(
        {
          b2b: Math.max(this.stats.b2b, 0),
          combo: Math.max(this.stats.combo, 0),
          enemies: 0,
          lines,
          perfectClear: this.board.perfectClear,
          piece: this.falling.symbol,
          spin: this.lastSpin ? this.lastSpin.type : "none",
          frame: this.frame,
        },
        this.gameOptions
      ).garbage,
      garbageAdded: false,
    };

    if (lines > 0) {
      res.sent -= this.garbageQueue.cancel(res.sent);
    } else {
      const garbages = this.garbageQueue.tank(this.frame);
      res.garbageAdded = garbages.length > 0;
      garbages.forEach((garbage) => this.board.insertGarbage(garbage));
    }

    this.nextPiece();

    this.lastSpin = null;
    return res;
  }

  recieveGarbage(...garbage: Garbage[]) {
    this.garbageQueue.recieve(...garbage);
  }

  hold() {
    if (this.held) {
      const save = this.held;
      this.held = this.falling.symbol;
      this.initiatePiece(save);
    } else {
      this.held = this.falling.symbol;
      this.nextPiece();
    }
  }

  getPreview(piece: Piece) {
    return tetrominoes[piece.toLowerCase()].preview;
  }

  bfs(depth: number, target: [number, number][]) {
    return bfs(this, depth, target);
  }

  onQueuePieces(
    listener: NonNullable<(typeof Queue)["prototype"]["repopulateListener"]>
  ) {
    this.queue.onRepopulate(listener);
  }
}

export * from "./queue";
export * from "./garbage";
export * from "./search";
export * from "./utils";
export * from "./board";
