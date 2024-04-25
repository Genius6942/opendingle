import { Board } from "./board";
import { GarbageQueue } from "./garbage";
import { Piece } from "./queue";

export type SpinType = "none" | "mini" | "normal";

export interface EngineCheckpoint {
  garbage: GarbageQueue["queue"];
  queue: number;
  board: Board["state"];
  falling: Piece;
	b2b: number;
	combo: number;
}
