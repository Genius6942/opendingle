import config from "../../../config";
import { readFile, writeFile } from "node:fs/promises";
import { join as joinPath } from "node:path";
import { FrameManager } from "../replayManager";

export interface GarbageRecord {
  iid: number;
  type: "send" | "recieve";
  data: {
    amount: number;
  };
}

export interface GarbageRecordV2 {
  amount: number;
  iid: number;
}

export class IGEHandlerV2 {
  players: Map<string, { incoming: number; outgoing: GarbageRecordV2[] }>;
  debugIGE: boolean;
  interactionID: number = 0;
  getCurrentFrame: () => number;

  constructor(
    players: string[],
    getCurrentFrame: (typeof FrameManager)["prototype"]["frame"],
  ) {
    this.players = new Map();
    players.forEach((player) => {
      this.players.set(player, { incoming: 0, outgoing: [] });
    });

    this.getCurrentFrame = getCurrentFrame;

    this.debugIGE = config.dev;
    if (this.debugIGE) {
      writeFile(
        joinPath(process.cwd(), IGEHandlerV2.IGEDebugFileName),
        "[]",
        "utf-8",
      );
    }
  }

  static IGEDebugFileName = "ige.json";

  async writeFile() {
    if (!this.debugIGE) return;
    const file = await readFile(
      joinPath(process.cwd(), IGEHandlerV2.IGEDebugFileName),
      "utf-8",
    );
    const prejson = JSON.parse(file);
    prejson.push({
      frame: this.getCurrentFrame(),
      data: Object.fromEntries(Array.from(this.players)),
    });
    await writeFile(
      joinPath(process.cwd(), IGEHandlerV2.IGEDebugFileName),
      JSON.stringify(prejson, null, 2),
      "utf-8",
    );
  }

  sendGarbage(playerID: string, amount: number) {
    const player = this.players.get(playerID);
    const iid = ++this.interactionID;

    if (!player)
      throw new Error(
        `player not found: player with id ${playerID} not in ${[
          ...(this.players.keys() as any),
        ].join(", ")}`,
      );
    this.players.set(playerID, {
      incoming: player.incoming,
      outgoing: [...player.outgoing, { iid, amount }],
    });

    this.writeFile();
    return true;
  }

  recieveGarbage(
    playerID: string,
    ackiid: number,
    iid: number,
    amount: number,
  ) {
    if (config.dev) {
      console.log(
        "ige in amount",
        amount,
        "at frame",
        this.getCurrentFrame(),
        "with ackiid",
        ackiid,
      );
    }
    const player = this.players.get(playerID);
    if (!player) throw new Error("player not found");

    const incomingIID = Math.max(iid, player.incoming ?? 0);

    const newIGEs: GarbageRecordV2[] = [];

    let runningAmount = amount;
    player.outgoing.forEach((item) => {
      if (item.iid <= ackiid) return;
      const amt = Math.min(item.amount, runningAmount);
      item = JSON.parse(JSON.stringify(item));
      item.amount -= amt;
      runningAmount -= amt;
      if (item.amount > 0) newIGEs.push(item);
    });

    this.players.set(playerID, { incoming: incomingIID, outgoing: newIGEs });

    this.writeFile();

    if (config.dev)
      console.log("final amount canceling above ige:", runningAmount);

    return runningAmount;
  }
}
