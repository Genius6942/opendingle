import { Packr, Unpackr } from "msgpackr";
import EventEmitter from "events";
import WebSocket from "ws";

import { fallbackEmitter } from "./emitter";
import Relationship from "./relationship";
import Room from "./room";

import { EVENTS_TYPES, RIBBON_CLOSE_CODES } from "../constants";
import * as Api from "../api";
import * as Types from "../types";
import { writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

import { log } from "../../../game/utils/log";

import { uploadLog } from "../../../lib/logsHandler";
import { removeRoom } from "../../../lib/roomLogger";
import config from "../../../config";
const globalPackr = new Packr({
  int64AsType: "number",
  bundleStrings: true,
  sequential: false,
});

const RIBBON_TAG = {
  STANDARD_ID: 0x45, // base
  EXTRACTED_ID: 0xae, // buffer packets
  BATCH: 0x58,
  EXTENSION: 0xb,
};

const EXTENSION_TAG = {
  PING: 0x0b, // client
  PONG: 0x0c, // server
};

// @ts-ignore
const RIBBON_EXTRACTED_ID_TAG = new Uint8Array([174]);
const RIBBON_STANDARD_ID_TAG = new Uint8Array([69]);
// @ts-ignore
const RIBBON_BATCH_TAG = new Uint8Array([88]);
const RIBBON_EXTENSION_TAG = new Uint8Array([0xb0]);

const RIBBON_EXTENSIONS = new Map();
RIBBON_EXTENSIONS.set(0x0b, (payload: any) => {
  if (payload.byteLength >= 6) {
    return {
      command: "ping",
      at: new DataView(payload.buffer).getUint32(2, false),
    };
  } else {
    return { command: "ping" };
  }
});
RIBBON_EXTENSIONS.set("ping", (extensionData?: number) => {
  if (typeof extensionData === "number") {
    const dat = new Uint8Array([0xb0, 0x0b, 0x00, 0x00, 0x00, 0x00]);
    new DataView(dat.buffer).setUint32(2, extensionData, false);
    return dat;
  } else {
    return new Uint8Array([0xb0, 0x0b]);
  }
});
RIBBON_EXTENSIONS.set(0x0c, (payload: any) => {
  if (payload.byteLength >= 6) {
    return {
      command: "pong",
      at: new DataView(payload.buffer).getUint32(2, false),
    };
  } else {
    return { command: "pong" };
  }
});
RIBBON_EXTENSIONS.set("pong", (extensionData?: number) => {
  if (typeof extensionData === "number") {
    const dat = new Uint8Array([0xb0, 0x0c, 0x00, 0x00, 0x00, 0x00]);
    new DataView(dat.buffer).setUint32(2, extensionData, false);
    return dat;
  } else {
    return new Uint8Array([0xb0, 0x0c]);
  }
});

const smartEncodePing = (
  packet: any,
  packr: Packr,
  extensionData = null as null | number
) => {
  if (typeof packet === "string") {
    // This might be an extension, look it up
    const found = RIBBON_EXTENSIONS.get(packet);
    if (found) {
      return found(extensionData);
    }
  }

  let prependable = RIBBON_STANDARD_ID_TAG;

  const msgpacked = packr.pack(packet);
  const merged = new Uint8Array(prependable.length + msgpacked.length);
  merged.set(prependable, 0);
  merged.set(msgpacked, prependable.length);

  return merged;
};

const smartDecodePong = (packet: any) => {
  if (packet[0] === RIBBON_EXTENSION_TAG[0]) {
    // look up this extension
    const found = RIBBON_EXTENSIONS.get(packet[1]);
    if (!found) {
      console.error(`Unknown Ribbon extension ${packet[1]}!`);
      console.error(packet);
      throw "Unknown extension";
    }
    return found(packet);
  }
  return false;
};

export default class Client {
  user: {
    token?: string;
    id?: string;
    username?: string;
  };

  // check ../types.ts
  events: fallbackEmitter<Types.SessionEvents & Types.RibbonEvents & Types.EventDataMap>;
  relationship: Omit<Relationship, "_propGet" | "_propSet">;
  room: Omit<Room, "_propGet" | "_propSet">;

  /* */

  private ribbon: {
    endpoint?: string;
    spoolToken?: string;
    migrateEndpoint?: string;
    resumeToken?: string;
    signature?: {};
  };

  session: {
    open?: boolean;
    dead?: boolean;
    authed?: boolean;
    id?: string | number;
    messageHistory?: any[];
    messageQueue?: any[];
    lastPong?: number;
    lastSent?: number;
    lastReceived?: string | number;
  };

  // legit too late but better than never
  //private debug: {}

  ws?: WebSocket;
  private packr?: Packr;
  private unpackr?: Unpackr;
  private heartbeat: any;
  verbose: boolean;
  handling: {
    arr: number;
    das: number;
    dcd: number;
    sdf: number;
    safelock: boolean;
    cancel: boolean;
  };
  log: string | boolean;
  logPath?: string;

  constructor(
    token: string,
    handling: {
      arr: number;
      das: number;
      dcd: number;
      sdf: number;
      safelock: boolean;
      cancel: boolean;
    },
    log: false | string = false,
    verbose = false
  ) {
    this.handling = handling;
    this.events = new EventEmitter();
    this.relationship = new Relationship(
      this._propGet.bind(this),
      this._propSet.bind(this)
    );
    this.room = new Room(this._propGet.bind(this), this._propSet.bind(this));

    this.user = {};
    this.ribbon = {};
    this.session = {};

    this.user.token = token;
    this.verbose = verbose;

    this.log = log;
  }

  async connect(endpoint?: string) {
    if (!this.user.token) return;
    if (!!this.session.authed) return;

    let user: any;
    try {
      user = await Api.game.getMe(this.user.token);
    } catch (e) {
      throw new Error(
        "Error occured while authenticating: " + e + "\nBot could possibly be banned."
      );
    }

    if (user.warnings.length > 0) {
      console.warn("WARNINGS:", JSON.stringify(user.warnings, null, 2));
    }
    // log(user.username);
    const spool =
      !!endpoint || user.role !== "bot"
        ? { endpoint, detail: "migrated", token: this.ribbon.spoolToken }
        : await Api.game.getSpool(this.user.token);

    if (user.role !== "bot") return log(":3");

    this.session.lastPong = Date.now();
    this.user.id = user._id;
    this.user.username = user.username;
    this.ribbon.endpoint = spool.endpoint;
    this.ribbon.spoolToken = spool.token;
    // log("ribbon:", this.ribbon);
    this.ribbon.signature = await Api.game.getRibbonSignature(this.user.token);

    this.ws = new WebSocket(`wss:${this.ribbon.endpoint}`, this.ribbon.spoolToken);

    this.ws.on("open", this._wsOnOpen.bind(this));
    this.ws.on("message", this._wsOnMessage.bind(this));
    this.ws.on("close", this._wsOnClose.bind(this));

    if (this.log) {
      // Get current UTC time
      const utcDate = new Date();

      // Convert to EST
      const now = new Date(
        utcDate.toLocaleString("en-US", { timeZone: "America/New_York" })
      );

      this.logPath =
        this.logPath ||
        path.join(
          process.cwd(),
          this.log as string,
          `[${now.getMonth() + 1}-${
            now.getDate() - 1
          }-${now.getFullYear()}] ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`
        );
      await writeFile(
        this.logPath,
        "[system]: Connected to ribbon " + this.ribbon.endpoint + "\n"
      );
    }
  }

  reset() {
    this.ribbon = {};
    this.session = {};
    this.relationship = new Relationship(
      this._propGet.bind(this),
      this._propSet.bind(this)
    );
  }

  /** @hidden */
  private _wsOnOpen() {
    this.packr = new Packr({
      int64AsType: "number",
      bundleStrings: true,
      sequential: false,
    });

    this.unpackr = new Unpackr({
      int64AsType: "number",
      bundleStrings: true,
      sequential: false,
    });

    this.session.open = true;
    this.session.dead = false;

    if (!this.ribbon.resumeToken) this.sendMessageDirect({ command: "new" });
    else {
      // log("trying to resume...");
      this.sendMessageDirect({
        command: EVENTS_TYPES.CLIENT_RESUME,
        socketid: this.session.id,
        resumetoken: this.ribbon.resumeToken,
      });

      this.sendMessageDirect({
        command: "hello",
        packets: this.session.messageHistory ?? [],
      });
    }

    this.heartbeat = setInterval(() => {
      if (this.ws!.readyState !== 1) return;
      if (Date.now() - this.session.lastPong! > 30000)
        this.ws!.close(4001, "pong timeout"); /* */

      // this.ws!.send(new Uint8Array([RIBBON_TAG.EXTENSION, EXTENSION_TAG.PING]));
      const ping = smartEncodePing(
        "ping",
        this.packr as Packr,
        this.session.lastReceived as number
      );
      this.ws?.send(ping);
      this.verbose && log("ping", this.session.lastReceived);
    }, 2500);
  }

  /** @hidden */
  private _wsOnMessage(data: any) {
    const pong = smartDecodePong(data);
    if (pong) {
      this.verbose && log("pong", pong.at);
      this.session.lastPong = Date.now();
      return;
    }
    const messages = decode(new Uint8Array(data), this.unpackr);
    if (messages?.error) return;
    for (const x of messages) {
      this.handleInternalMessage(x);
    }
  }

  /** @hidden */
  private _wsOnClose(e: any) {
    /* emit this */
    //if (!!e) log(e)

    if (!!this.ribbon.migrateEndpoint) {
      this.connect(this.ribbon.migrateEndpoint);
      this.ribbon.migrateEndpoint = "";
      return;
    }

    this.ws!.removeAllListeners();
    this.session.open = false;

    clearInterval(this.heartbeat);

    log(
      "Ribbon closed for reason:",
      e.code && e.code.toString && e.code.toString() in RIBBON_CLOSE_CODES
        ? RIBBON_CLOSE_CODES[e.code.toString() as keyof typeof RIBBON_CLOSE_CODES]
        : e.code
    );
    if (!this.session.dead) this.die(true);

    // if (!this.session.dead) {
    //   log("Reconnecting from status code", e);
    //   this.session.authed = false;
    //   this.connect();
    // }
  }

  appendLog({ message, type }: { message: any; type: "send" | "recive" }) {
    if (!this.log || !this.logPath) return;
    writeFile(this.logPath, `[${type}]: ${JSON.stringify(message)}\n`, {
      flag: "a",
    });
  }

  /** send message to ribbon but direct, meh */
  sendMessageDirect(msg: any): void {
    //log(msg)

    // log('sending', msg)
    if (msg.command === "replay" && msg.data.frames) {
      try {
        const sentFrames: number[] = [];
        msg.data.frames.forEach((frame: any) => {
          if (sentFrames.includes(frame.frame)) return;
          sentFrames.push(frame.frame);
          // log("send frame", frame.frame);
        });
      } catch (e) {
        log(msg.data);
        throw e;
      }
    }

    this.appendLog({ message: msg, type: "send" });

    this.ws!.send(encode(msg, this.packr));
  }

  /** send message to ribbon */
  sendMessage(msg: any): void {
    // log('sending', msg, 'eeee')
    this.session.lastSent = !!this.session.lastSent ? this.session.lastSent + 1 : 1;

    msg.id = this.session.lastSent;

    if (this.session.messageQueue === undefined) this.session.messageQueue = [];
    if (this.session.messageHistory === undefined) this.session.messageHistory = [];

    this.session.messageQueue.push(msg);
    this.session.messageHistory.push(msg);

    if (this.session.messageQueue.length >= 500) this.session.messageHistory.shift();
    if (!this.session.open || this.session.dead) {
      // log('no send', msg, 'because session not open.')
      return;
    }

    for (let i = 0; i < this.session.messageQueue!.length; i++) {
      const message = this.session.messageQueue!.shift();
      // log('sendMessage', message)
      this.sendMessageDirect(message);
    }
  }

  private handleInternalMessage(msg: any): void {
    if (msg.type === "Buffer") {
      const packet = Buffer.from(msg.data);
      const message = decode(packet, this.unpackr);

      if (message?.error) return;

      this.handleInternalMessage(message);
    }
    this.appendLog({ message: msg, type: "recive" });

    if (msg.command !== "hello" && msg.id) {
      if (msg.id > (this.session.lastReceived ?? -1)) {
        this.session.lastReceived = msg.id;
      } else return;
    }

    if (!!msg.command) this.handleCommand(msg);
    //else log(msg)
  }

  private handleCommand(msg: any) {
    switch (msg.command) {
      case EVENTS_TYPES.RIBBON_PONG: {
        log("pong");
        this.session.lastPong = Date.now();
        break;
      }

      case EVENTS_TYPES.RIBBON_HELLO: {
        this.session.id = msg.id;
        this.ribbon.resumeToken = msg.resume;

        if (!this.session.authed) {
          this.sendMessageDirect({
            command: "authorize",
            id: this.session.lastSent ?? 0,
            data: {
              token: this.user.token,
              handling: this.handling,
              signature: this.ribbon.signature,
            },
          });

          for (const x of msg.packets) {
            this.handleInternalMessage(x);
          }
        }

        break;
      }

      case EVENTS_TYPES.RIBBON_AUTHORIZE: {
        if (msg.data.success) {
          this.session.authed = true;
          if (!this.relationship._init) this.relationship._setInitVal(msg.data.social);

          this.sendMessage({
            command: EVENTS_TYPES.CLIENT_UPDATE_PRESENCE,
            data: {
              status: "online",
              detail: "menus",
            },
          });

          // tetrio client does it twice so we will too
          this.sendMessage({
            command: EVENTS_TYPES.CLIENT_UPDATE_PRESENCE,
            data: {
              status: "online",
              detail: "menus",
            },
          });

          this.events.emit(EVENTS_TYPES.SESSION_READY, this.ribbon.endpoint!);
        } else {
          this.die();
          log("ded from failure to authorizes");
          this.events.emit(EVENTS_TYPES.SESSION_ERROR, "failed to authorize ribbon");
        }

        break;
      }

      case EVENTS_TYPES.RIBBON_MIGRATE: {
        // log("migrating");
        this.ribbon.migrateEndpoint =
          this.ribbon.endpoint!.split("/ribbon/")[0] + msg.data.endpoint;
        this.session.authed = false;
        this.die();
        // log("migrating to", msg.data.endpoint);

        //this.events.emit("SESSION_MIGRATE", "")

        break;
      }

      case EVENTS_TYPES.RIBBON_NOPE: {
        this.ribbon = {};
        log("noped, force restarting connection");
        log("message", msg);
        this.ws?.close();
        this.die(true);
        this.connect();

        break;
      }

      case "kick": {
        this.ribbon = {};
        log("kicked for reason:", msg.data.reason);
        (async () => {
          this.die(true);
        })();

        break;
      }

      case EVENTS_TYPES.ERROR: {
        this.events.emit("error", msg.data);
        break;
      }

      default:
        // msg.command !== "replay" && msg.command !== 'game.replay.board' && log(msg);
        // const msgCopy = JSON.parse(JSON.stringify(msg));
        // if (msgCopy.command === "replay") {
        //   msgCopy.data.frames = msgCopy.data.frames.filter(
        //     (frame: any) => !["keyup", "keydown"].includes(frame.type)
        //   );
        // }

        // msg.command !== "game.replay.board" &&
        //   !(msg.command === "replay" && msg.data.frames.length === 0) &&
        //   log(JSON.stringify(msgCopy, null, 2));
        this.handleMessage(msg);
    }
  }

  // private handleMessage(msg: any): void {
  handleMessage(msg: any): void {
    this.events.emit(msg.command, msg.data);
  }

  /** kill the client */
  async die(sad?: boolean): Promise<void> {
    if (!!this.session.dead) return;

    this.session.dead = true;
    if (sad) {
      this.session.authed = false;
      if (this.room.code) removeRoom(this.room.code);
      // it is incredibly important that the logs get uploaded
      // hopefully they do this time 🐒 :)
      await this.uploadLogs();
    }
    if (this.ws) this.ws.close(1000, "die");

    this.events.emit(EVENTS_TYPES.SESSION_DEAD, !!sad);
  }

  async uploadLogs() {
    // upload to google storage bucket yay
    if (this.logPath) {
      try {
        // const storage = new Storage({
        //   credentials: JSON.parse(
        //     (await readFile(
        //       path.join(
        //         __dirname,
        //         "../../../../",
        //         process.env.SERVICE_ACCOUNT!
        //       )
        //     )) as any as string
        //   ),
        // });
        // await storage.bucket("websocket-logs").upload(this.logPath);
        await uploadLog({
          timestamp: new Date(),
          content: await readFile(this.logPath, { encoding: "utf-8" }),
        });
      } catch (e) {
        console.error("Failed to upload", this.logPath, "to database", e);
      }

      try {
        if (!config.dev) await unlink(this.logPath);
      } catch (e) {
        console.error("failed to delete", this.logPath, ":\n", e);
      }
    }
  }

  /* user consumed utils */

  /**
   * send a direct message to a user
   *
   * @param the user's id.
   * @param the message.
   * @returns if the client succeeded sending the dm, false if the target might've been not friended by the client
   */
  sendDM(target: string, message: string): boolean {
    this.sendMessage({
      command: EVENTS_TYPES.CLIENT_SEND_DM,
      data: {
        recipient: target,
        msg: message,
      },
    });

    return true;
  }

  /**
    join a room

    @param room's code, usually 4 letters long and always case-insensitive
  */
  joinRoom(code: string): void {
    this.sendMessage({
      command: EVENTS_TYPES.CLIENT_JOIN_ROOM,
      data: code,
    });
  }

  // type this
  editPresence(status: string, detail: string): void {
    this.sendMessage({
      command: "social.presence",
      data: {
        status: status || "online",
        detail: detail || "",
      },
    });
  }

  // whacky ahh stuff to try to not create a cyclic reference
  /** @hidden */
  private _propGet(i: keyof typeof this) {
    // ugly but whatever
    if (
      i === "__proto__" ||
      i === "constructor" ||
      i === "_propGet" ||
      i === "_propSet" ||
      i === "ws" ||
      i === "packr" ||
      i === "unpackr" ||
      i === "_wsOnOpen" ||
      i === "_wsOnClose" ||
      i === "_wsOnMessage" ||
      i === "relationship" ||
      i === "room"
    )
      return undefined;

    return typeof this[i] === "function" ? (this[i] as any).bind(this) : this[i];
  }

  /** @hidden */
  private _propSet(i: any, val: any): void {
    if (
      i === "__proto__" ||
      i === "constructor" ||
      i === "_propGet" ||
      i === "_propSet" ||
      i === "ws" ||
      i === "packr" ||
      i === "unpackr" ||
      i === "_wsOnOpen" ||
      i === "_wsOnClose" ||
      i === "_wsOnMessage" ||
      i === "relationship" ||
      i === "room"
    )
      return;

    //@ts-ignore
    this[i] = val;
  }
}

/* */

function decode(packet: any, unpackr: any): any {
  if (packet[0] === RIBBON_TAG.STANDARD_ID)
    return unpackr.unpackMultiple(packet.slice(1));
  else if (packet[0] === RIBBON_TAG.EXTRACTED_ID) {
    const message = globalPackr.unpack(packet.slice(5));
    const view = new DataView(packet.buffer);

    message.id = view.getUint32(1, false);

    return [message];
  } else if (packet[0] === RIBBON_TAG.BATCH) {
    const items = [];
    const lengths = [];

    const batchView = new DataView(packet.buffer);

    for (let i = 0; true; i++) {
      const length = batchView.getUint32(1 + i * 4, false);

      if (length === 0) break;

      lengths.push(length);
    }

    let pointer = 0;

    for (let i = 0; i < lengths.length; i++) {
      items.push(
        packet.slice(
          1 + lengths.length * 4 + 4 + pointer,
          1 + lengths.length * 4 + 4 + pointer + lengths[i]
        )
      );
      pointer += lengths[i];
    }

    return [].concat(...items.map((item) => decode(item, unpackr)));
  } else if (packet[0] === RIBBON_TAG.EXTENSION) {
    if (packet[1] === EXTENSION_TAG.PONG) return [{ command: "pong" }];
    else return [];
  } else return [unpackr.unpack(packet)];
}

function encode(message: any, packr: any): any {
  const msgpacked = packr.encode(message);
  const packet = new Uint8Array(msgpacked.length + 1);

  packet.set([0x45], 0);
  packet.set(msgpacked, 1);

  if (msgpacked.length === 5) log(msgpacked);

  return packet;
}
