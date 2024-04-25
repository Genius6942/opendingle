import { uploadLog } from "../../lib/logsHandler";
import { PieceLocation } from "../cold-clear/types";
import { EngineInitializeParams } from "../engine";

export interface KeyState {
  type: "key";
  location: PieceLocation;
  frame: number;
}

export interface GarbageState {
  frame: number;
  type: "garbage";
  size: number;
  column: number;
  amount: number;
}

export type GlogState = GarbageState | KeyState;

export const loggerTimestampFormat = "M-D-YYYY H-m-s";

export class GameLogger {
  states: GlogState[];
  gameOptions: EngineInitializeParams;
  id: string;
  timestamp: Date;
  flag: boolean;
  people: string[];
  round: number;
  constructor(
    id: string,
    people: string[],
    gameOptions: EngineInitializeParams,
    round = 1,
    flag = false,
  ) {
    this.states = [];
    this.id = id;
    this.gameOptions = gameOptions;
    this.flag = flag;
    this.people = people;
    this.round = round;

    this.timestamp = new Date();
  }

  pushState(state: GlogState) {
    this.states.push(state);
  }

  export() {
    return {
      listenID: this.id,
      states: this.states,
      timestamp: this.timestamp,
      flagged: this.flag,
      players: this.people,
      gameOptions: this.gameOptions,
      round: this.round,
    };
  }

  async uploadToCloud() {
    return await uploadLog(this.export(), "glogs");
  }
}
