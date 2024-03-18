export type Message =
  | SysErrorMessage
  | RulesMessage
  | StartMessage
  | StopMessage
  | SuggestMessage
  | PlayMessage
  | NewPieceMessage
  | QuitMessage
  | ErrorMessage
  | ReadyMessage
  | InfoMessage
  | SuggestionMessage;

export type Piece = "T" | "J" | "Z" | "O" | "S" | "L" | "I";
export type BoardCell = Piece | null | "G";

/**
 * Custom system error message
 */
export interface SysErrorMessage {
  type: "syserror";
  reason: string;
  msg: string;
}

export interface RulesMessage {
  type: "rules";
  randomizer?: "uniform" | "seven_bag" | "general_bag" | "unknown";
}

export interface StartMessage {
  type: "start";
  hold: string | null;
  queue: string[];
  combo: number;
  back_to_back: boolean;
  board: BoardCell[][];
}

export interface StopMessage {
  type: "stop";
}

export interface SuggestMessage {
  type: "suggest";
}

export interface PlayMessage {
  type: "play";
  move: {
    location: PieceLocation;
    spin: "none" | "mini" | "full";
  };
}

export interface NewPieceMessage {
  type: "new_piece";
  piece: string;
}

export interface QuitMessage {
  type: "quit";
}

export interface ErrorMessage {
  type: "error";
  reason: "unsupported_rules";
}

export interface ReadyMessage {
  type: "ready";
}

export interface InfoMessage {
  type: "info";
  name: string;
  version: string;
  author: string;
  features: string[];
}

export interface SuggestionMessage {
  type: "suggestion";
  moves: {
    location: PieceLocation;
    spin: "none" | "mini" | "full";
  }[];
}

export interface PieceLocation {
  type: string;
  orientation: "north" | "east" | "south" | "west";
  x: number;
  y: number;
}

export interface TypedEmitter<E extends Record<string, any>> {
  on<T extends keyof E>(event: T, listener: (data: E[T]) => void): this;
  once<T extends keyof E>(event: T, listener: (data: E[T]) => void): this;
  off<T extends keyof E>(event: T, listener: (data: E[T]) => void): this;
  emit<T extends keyof E>(event: T, args: E[T]): boolean;
}

interface EmitterOverload<E extends Record<string, any>> {
  // fallback to unknown
  on<T extends Exclude<string, keyof E>>(
    event: T,
    listener: (data: unknown) => void,
  ): this;
  once<T extends Exclude<string, keyof E>>(
    event: T,
    listener: (data: unknown) => void,
  ): this;
  off<T extends Exclude<string, keyof E>>(
    event: T,
    listener: (data: unknown) => void,
  ): this;
  emit<T extends Exclude<string, keyof E>>(event: T, data: any): boolean;
}

export type fallbackEmitter<E extends object> = TypedEmitter<E> &
  EmitterOverload<E>;
