import { EventEmitter } from "node:events";
import { fallbackEmitter } from "../../cold-clear/types";
import { FrameManager } from "../replayManager";

export interface IGEMessage {
  id: number;
  targetFrame: number;
  data:
    | {
        type: "interaction_confirm" | "interaction";
        data:
          | {
              type: "targeted";
              value: boolean;
            }
          | {
              type: "garbage";
              iid: number;
              amt: number;
              ackiid: number;
              x: number;
              y: number;
              column: number;
              size: number;
              username: string;
            };
        frame: number;
        gameid: string;
        cid: number;
      }
    | {
        type: "target";
        targets: string[];
        frame: number;
      }
    | {
        type: "allow_targeting";
        value: boolean;
        frame: number;
      }
    | {
        type: "kev";
        victim: {
          gameid: string;
          name: string;
        };
        killer: {
          gameid: string;
          name: string;
          type: "sizzle";
        };
        fire: number;
      };
}

type ExtractTypeValues<T> = T extends { data: { type: infer U } } ? U : never;

type ValidIGETypes = ExtractTypeValues<IGEMessage>;
type MessageType<T extends ValidIGETypes> = {
  [Key in T]: [IGEMessage & { data: { type: Key } }, number];
};

type IGEMessageMap = MessageType<ValidIGETypes>;

export class IGEMessageHandler {
  gameID: string;
  private events: fallbackEmitter<IGEMessageMap>;
  on: fallbackEmitter<IGEMessageMap>["on"];
  off: fallbackEmitter<IGEMessageMap>["off"];
  once: fallbackEmitter<IGEMessageMap>["once"];
  sendFrames: import("../replayManager").FrameManager["push"];
  getCurrentFrame: () => number;
  id: number;
  constructor(id: number, gameID: string, frameManager: FrameManager) {
    this.gameID = gameID;
    this.id = id;

    this.events = new EventEmitter();

    this.on = this.events.on.bind(this.events);
    this.off = this.events.off.bind(this.events);
    this.once = this.events.once.bind(this.events);
    this.handleIGEMessage.bind(this);
    this.sendFrames = frameManager.push.bind(frameManager);
    this.getCurrentFrame = frameManager.frame.bind(frameManager);
  }

  handleIGEMessage(event: IGEMessage[]) {
    const frame = this.getCurrentFrame();
    event.forEach((message) => {
      this.events.emit(message.data.type, [message, frame]);
      this.sendFrames(this.gameID, {
        frame,
        type: "ige",
        data: {
          id: message.id,
          frame,
          type: "ige",
          data: message.data,
        },
      });
    });
  }
}
