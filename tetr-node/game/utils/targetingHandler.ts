// authored by luke!

import { FrameManager } from "./replayManager";

export const strategyMap = {
  even: 0,
  elims: 1,
  random: 2,
  payback: 3,
};

export type TargetingStrategy = keyof typeof strategyMap;

export class TargetingHandler {
  private frameManager: FrameManager;

  id: null | string = null;
  gameID: null | string = null;

  private _strategy: TargetingStrategy | "manual";
  private target: null | string = null;
  private _targets: string[] = [];
  private lastStrategy: TargetingStrategy;

  newTargetInterval: number | null = 1000;
  private targetingIntervalID: NodeJS.Timer | null = null;

  ingame = false;

  constructor(
    options:
      | { frameManager: FrameManager; strategy: TargetingStrategy }
      | {
          frameManager: FrameManager;
          targets: string[];
          newTargetInterval?: number;
        },
  ) {
    this.frameManager = options.frameManager;

    if ("targets" in options) {
      this.strategy = "manual";
      this.targets = options.targets;
      if (options.newTargetInterval)
        this.newTargetInterval = options.newTargetInterval;
    } else {
      this.strategy = options.strategy;
    }
  }

  newRandomTarget() {
    if (this.strategy !== "manual") return;
    if (this.targets.length === 0) {
      return;
    }

    if (this.targets.length === 1) {
      this.target = this.targets[0];
      if (this.ingame) this.updateServerTarget();
      return;
    }

    const genTarget = () => {
      const target =
        this.targets[Math.floor(Math.random() * this.targets.length)];
      if (target === this.target) {
        return genTarget();
      }
    };

    this.target = genTarget();
    if (this.ingame) this.updateServerTarget();
  }

  start(id: string, gameID: string) {
    this.id = id;
    this.gameID = gameID;
    this.updateServerTarget();

    if (this.newTargetInterval) {
      this.targetingIntervalID = setInterval(() => {
        this.newRandomTarget();
      }, this.newTargetInterval);
    }

    this.ingame = true;
  }

  stop() {
    if (this.targetingIntervalID) {
      clearInterval(this.targetingIntervalID as any);
      this.targetingIntervalID = null;
    }

    this.ingame = false;
  }

  private updateServerTarget() {
    if (!this.id) {
      return;
    }

    if (!this.ingame) {
      return;
    }
    const frame = this.frameManager.frame.bind(this.frameManager)();

    if (this.strategy === "manual") {
      const message = {
        frame,
        type: "target",
        data: {
          id: "diyusi",
          frame,
          type: "target",
          data: this.target + this.gameID,
        },
      };
      this.frameManager.push.bind(this.frameManager)(this.id, message);
    } else {
      const message = {
        frame,
        type: "strategy",
        data: {
          id: "diyusi",
          frame,
          type: "strategy",
          data: strategyMap[this.strategy],
        },
      };

      const keypress = {
        frame,
        type: "keydown",
        data: {
          key: "target" + (strategyMap[this.strategy] + 1).toString(),
          subframe: 0,
        },
      };

      this.frameManager.push.bind(this.frameManager)(this.id, message);
      this.frameManager.push.bind(this.frameManager)(this.id, keypress);
    }
  }

  get targets() {
    return this._targets;
  }

  set targets(targets: string[]) {
    this._strategy = "manual";
    this._targets = targets;
    this.newRandomTarget();
  }

  get strategy() {
    return this._strategy;
  }

  set strategy(strategy: TargetingStrategy | "manual") {
    this._strategy = strategy;
    if (strategy !== "manual") {
      this.lastStrategy = strategy;
    }
    this.updateServerTarget();
  }

  revertStrategy() {
    this.strategy = this.lastStrategy;
  }

  get currentTarget() {
    return this.target;
  }
}
