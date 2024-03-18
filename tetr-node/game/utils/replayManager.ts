export interface Frame {
  frame: number;
  type: string;
  data?: any;
}

const moveElementToFirst = <T>(arr: T[], n: number) => [
  arr[n],
  ...arr.slice(0, n),
  ...arr.slice(n + 1),
];

export class FrameManager {
  private sendMessage: (data: any) => void;
  private frameQueue: Frame[];
  private timeout?: any;
  beginTimestamp: number;
  gameID: string;
  stalling = false;

  static constants = {
    fps: 60,
    messagesPerSecond: 5,
  };

  // @ts-ignore
  private lastSentFrame: number;
  ongoing: boolean;

  constructor(sendMessage: (data: any) => void) {
    this.sendMessage = sendMessage;

    this.frameQueue = [];

    this.beginTimestamp = 0;
    this.gameID = "";
    this.lastSentFrame = 0;
    this.ongoing = false;
  }

  updateBeginTimestamp() {
    this.beginTimestamp = performance.now();
  }

  start(gameID: string) {
    this.updateBeginTimestamp();
    this.gameID = gameID;
    this.lastSentFrame = 0;

    this.ongoing = true;

    this.timeout = setTimeout(this.frameLoop.bind(this), 0);
    this.stalling = false;
  }

  stop() {
    this.timeout = clearTimeout(this.timeout);
    this.ongoing = false;
  }

  stall() {
    this.stalling = true;
  }

  unstall() {
    this.stalling = false;
  }

  getCurrentFrame() {
    if (!this.ongoing) return 0;
    return Math.floor(
      (performance.now() - this.beginTimestamp) /
        (1000 / FrameManager.constants.fps),
    );
  }

  frame() {
    return this.getCurrentFrame();
  }

  push(gameID: string, ...frames: Frame[]) {
    if (gameID !== this.gameID) return;
    this.frameQueue.push(...frames);
  }

  clear() {
    this.frameQueue = [];
  }

  private flushFrames() {
    const currentFrame = this.getCurrentFrame();
    const returnFrames = this.frameQueue.filter(
      (frame) => frame.frame <= currentFrame,
    );
    this.frameQueue = this.frameQueue.filter(
      (frame) => frame.frame > currentFrame,
    );

    // move the full frame to the front as a precaution
    const fullFrameIndex = returnFrames.findIndex(
      (frame) => frame.type === "full",
    );
    if (fullFrameIndex >= 0) {
      return moveElementToFirst(returnFrames, fullFrameIndex);
    } else {
      return returnFrames;
    }
  }

  private sendFrames() {
    // leave provisioned frames [0, 1] for starting messages, do it later.
    if (this.getCurrentFrame() < 2) return;
    const frames = this.flushFrames();

    const msg = {
      command: "replay",
      data: {
        gameid: this.gameID,
        frames,
        provisioned: this.getCurrentFrame(),
      },
    };
    this.sendMessage(msg);
  }

  frameLoop() {
    if (!this.stalling) {
      this.sendFrames();
    }

    this.timeout = setTimeout(
      this.frameLoop.bind(this),
      1000 / FrameManager.constants.messagesPerSecond,
    );
  }

  forceFlush() {
    this.sendFrames();
    if (typeof this.timeout === "number") {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(
        this.frameLoop.bind(this),
        1000 / FrameManager.constants.messagesPerSecond,
      );
    }
  }
}
