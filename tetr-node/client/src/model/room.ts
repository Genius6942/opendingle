// TODO: make a message model and include `mentions` property, yk like the one js discord lib has
import EventEmitter from "events";
import { TypedEmitter } from "./emitter";
import { EVENTS_TYPES } from "../constants";
import Client from "./client";
import { AddUserData, Player } from "../types";

export default class Room extends (EventEmitter as {
  new (): TypedEmitter<{}>;
}) {
  type: "public" | "private" | null;
  state: "lobby" | "ingame" | null;
  code: string | null;
  name: string | null;
  host: string | null;
  creator: string | null;
  options: any;

  players: Player[];

  // /** @hidden */
  private _propGet: <T extends keyof Client>(key: T) => Client[T];

  constructor(_propGet: any, _propSet: any) {
    super();

    this.type = null;
    this.state = null;
    this.code = null;
    this.name = null;
    this.host = null;
    this.creator = null;
    this.options = {};
    this.players = [];

    this._propGet = _propGet;

    // bind listeners
    this.onHostUpdate = this.onHostUpdate.bind(this);
    this.onPlayerJoin = this.onPlayerJoin.bind(this);
    this.onPlayerLeave = this.onPlayerLeave.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
  }

  /** join a room */
  join(
    code: string,
  ): Promise<
    | false
    | Pick<
        this,
        | "type"
        | "state"
        | "code"
        | "name"
        | "host"
        | "creator"
        | "options"
        | "players"
      >
  > {
    return new Promise(
      (resolve: (x: Awaited<ReturnType<typeof this.join>>) => void, reject) => {
        // return false if client is already in a room
        // might make it automatically leave and then join the new room later
        if (this.code !== null) return resolve(false);
        this._propGet("sendMessage")({
          command: EVENTS_TYPES.CLIENT_JOIN_ROOM,
          data: code,
        });
        this._propGet("events").once("error", (err: any) => {
          reject(err);
        });
        // TODO: type data
        // listen to room.update event instead of room.join cuz it has more data
        this._propGet("events").once(
          EVENTS_TYPES.RIBBON_ROOM_UPDATE,
          (data: any) => {
            this.type = data.type;
            this.state = data.state;
            this.code = data.id;
            this.name = data.name;
            this.host = data.owner;
            this.creator = data.creator;
            this.options = data.options;
            this.players = data.players;

            this.initEvents();

            return resolve({
              type: data.type,
              state: data.state,
              code: data.id,
              name: data.name,
              host: data.owner,
              creator: data.creator,
              options: data.options,
              players: data.players,
            });
          },
        );
      },
    );
  }

  // events
  private onHostUpdate(user: string) {
    this.host = user;
  }

  private onPlayerJoin(data: AddUserData) {
    this.players.push(data);
  }

  private onPlayerLeave(data: string) {
    const index = this.players.findIndex((player) => player._id === data);
    if (index >= 0) {
      this.players.splice(index, 1);
    }
  }

  private onUpdate(data: any) {
    this.code = data.id;
    this.name = data.name;
    this.host = data.owner;
    this.creator = data.creator;
    this.options = data.options;
    this.players = data.players;
  }

  private initEvents() {
    this._propGet("events").on("room.update.host", this.onHostUpdate);
    this._propGet("events").on("room.addplayer", this.onPlayerJoin);
    this._propGet("events").on("room.removeplayer", this.onPlayerLeave);
    this._propGet("events").on("room.update", this.onUpdate);
  }

  private destroyEvents() {
    this._propGet("events").off("room.update.host", this.onHostUpdate);
    this._propGet("events").off("room.addplayer", this.onPlayerJoin);
    this._propGet("events").off("room.removeplayer", this.onPlayerLeave);
    this._propGet("events").off("room.update", this.onUpdate);
  }

  /** leave the current room */
  leave(): Promise<boolean> {
    return new Promise((resolve: (x: boolean) => void) => {
      if (this.code === null) return resolve(false);
      this.destroyEvents();

      this._propGet("sendMessage")({
        command: EVENTS_TYPES.CLIENT_LEAVE_ROOM,
      });

      this._propGet("events").once(EVENTS_TYPES.RIBBON_ROOM_LEAVE, () => {
        // basically reset to init state
        this.type = null;
        this.state = null;
        this.code = null;
        this.name = null;
        this.host = null;
        this.creator = null;
        this.options = {};
        this.players = [];

        this._propGet("sendMessage")({
          command: EVENTS_TYPES.CLIENT_UPDATE_PRESENCE,
          data: {
            status: "online",
            detail: "menus",
          },
        });

        this.destroyEvents();

        // if id === this.code then this
        return resolve(true);
      });
    });
  }

  /**
   * create a room
   *
   * for "safety" reason, if no argument were provided the room will default to private
   * trust me, accidentally creating a public room sucksss
   */
  create(
    type: "public" | "private" = "private",
  ): Promise<
    | boolean
    | Pick<
        this,
        | "type"
        | "state"
        | "code"
        | "name"
        | "host"
        | "creator"
        | "options"
        | "players"
      >
  > {
    return new Promise(
      (resolve: (x: Awaited<ReturnType<typeof this.join>>) => void) => {
        if (this.code !== null) return resolve(false);

        this._propGet("sendMessage")({
          command: EVENTS_TYPES.CLIENT_CREATE_ROOM,
          data: type,
        });

        this._propGet("events").once(
          EVENTS_TYPES.RIBBON_ROOM_UPDATE,
          (data: any) => {
            this.type = data.type;
            this.state = data.state;
            this.code = data.id;
            this.name = data.name;
            this.host = data.owner;
            this.creator = data.creator;
            this.options = data.options;
            this.players = data.players;

            this._propGet("sendMessage")({
              command: EVENTS_TYPES.CLIENT_UPDATE_PRESENCE,
              data: {
                status: "online",
                detail: "X-PRIV",
              },
            });

            this.initEvents();

            return resolve({
              type: data.type,
              state: data.state,
              code: data.id,
              name: data.name,
              host: data.owner,
              creator: data.creator,
              options: data.options,
              players: data.players,
            });
          },
        );
      },
    );
  }

  /** update the current room's config */
  // @ts-ignore
  update(config: any): Promise<boolean> {
    return new Promise((resolve: (x: boolean) => void) => {
      if (this._propGet("user").id !== this.host) return resolve(false);

      //
      return resolve(true);
    });
  }

  kick() {}
  ban() {}
  clearChat() {}
  updateId(id: string) {
    if (this.host !== this._propGet("user").id)
      throw new Error("Error changing roomid: Bot is not host");
    if (id.length > 4 || id.length < 1)
      throw new Error("Invalid room id. Must be 1-4 alphanumeric characters.");
    if (!/^[a-zA-Z0-9]+$/.test(id))
      throw new Error("Invalid room id. Must be 4 alphanumeric characters.");
    return new Promise<void>((resolve, reject) => {
      this._propGet("sendMessage")({
        command: "room.setid",
        data: id.toUpperCase(),
      });
      this._propGet("events").once("room.update", () => {
        resolve();
      });
      this._propGet("events").once("err", (err: string) => {
        reject("An error occured. Reason: " + err);
      });
      this._propGet("events").once("error", (e: string) => {
        reject(e);
      });
    });
  }
  sendMessage(message: string, pinned = false) {
    return new Promise<void>((resolve) => {
      this._propGet("sendMessage")({
        command: "room.chat.send",
        data: {content: message, pinned},
      });
      this._propGet("events").once("room.chat", () => {
        resolve();
      });
    });
  }
  invite() {}
  start() {
    return new Promise<void>((resolve) => {
      this._propGet("sendMessage")({
        command: "room.start",
      });
      this._propGet("events").once("game.ready", () => {
        resolve();
      });
    });
  }
  abort() {}
  transferHost(player: string) {
    return new Promise<void>((resolve) => {
      this._propGet("sendMessage")({
        command: "room.owner.transfer",
        data: player,
      });
      this._propGet("events").once("room.update.host", () => {
        resolve();
      });
    });
  }
  switchSelfBracket(bracket: "spectator" | "player") {
    return new Promise<void>((resolve, reject) => {
      this._propGet("sendMessage")({
        command: "room.bracket.switch",
        data: bracket,
      });

      this._propGet("events").once("room.update.bracket", () => {
        resolve();
      });

      this._propGet("events").once("error", (err: string) => {
        reject(err);
      });
    });
  }

  // @ts-ignore
  switchBracket(user: any, bracket: "spectator" | "player") {}
}
