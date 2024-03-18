export type Piece = "L" | "I" | "J" | "Z" | "S" | "O" | "T";

export type Move =
  | "left"
  | "right"
  | "soft"
  | "hard"
  | "rotate"
  | "rotateccw"
  | "hold";

export type Garbage = {
  amount: number;
  column: number;
  size: number;
  frame: number;
  initiated: boolean;
};
