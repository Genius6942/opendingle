import { Client } from "../client/src/index";
import dotenv from "dotenv";
import { Commands, RestrictionLevel } from "./utils/commands2";
import { bag7 } from "./utils/rng";
import { GameEndData, IGEKevFrame, RibbonEvents } from "../client/src/types";
import startEvent from "./utils/startEvent";
import handling from "./utils/handling";
// @ts-ignore
import Filter from "bad-words";
import Room from "../client/src/model/room";
import ColdClear from "./cold-clear";
import { Garbage, Piece } from "./types";
import { FrameManager } from "./utils/replayManager";
import { GameLogger } from "./utils/logger";
import config from "../config";
import { IGEHandlerV2 } from "./utils/garbage/igeHandler";
import { calculateIncrease } from "./utils/increases";
import { SettingsHandler } from "./utils/settingsHandler";
import { log } from "./utils/log";
import { addRoom } from "../lib/roomLogger";
import { IGEMessage, IGEMessageHandler } from "./utils/garbage/igeMessageHandler";
import { getMSTillNextPiece, getStaticMSTillNextPiece } from "./utils/pps";
import { addPieces } from "../lib/stats";
import { Engine, EngineInitializeParams } from "./engine";
import { TargetingHandler, strategyMap } from "./utils/targetingHandler";
import { deepCopy } from "./engine/utils";
import { afterGame } from "../lib/accounts";
const profanity = new Filter();
dotenv.config();

export default function runBot(
  token: string,
  options:
    | { joinRoom: string }
    | { createRoom: string | true; type?: "public" | "private" }
    | {}
    | undefined = {}
) {
  return new Promise<{
    readonly kill: () => void;
    readonly session: () => Client;
    readonly onConnect: (cb: () => void) => void;
    readonly room: () => Omit<Room, "_propGet" | "_propSet">;
    readonly awaitReady: Promise<void>;
    readonly onKill: (cb: () => void) => void;
  }>((resolve, reject) => {
    const roomCode =
      "joinRoom" in options
        ? options.joinRoom
        : "createRoom" in options && typeof options.createRoom === "string"
        ? options.createRoom
        : false;

    if (roomCode && typeof roomCode === "string") {
      if (roomCode in config.constants.bannedRooms) {
        reject(config.constants.bannedRooms[roomCode]);
      }
    }

    let session = new Client(token, handling, "wslogs/");

    const commands = new Commands(">", "");

    const settings = {
      enabled: true,
      gameplay: {
        rank: "C",
        opener: null as string | null,
        pps: 1,
        // max amount of the pps that the speed can increase/decrease to ensure accurate pps even when bursting
        ppsMaxChange: 0.2,
        loop: null as string | null,
        manualTargets: [] as string[],
        burst: 1,
        burstBuffer: 8,
        acceleration: 0,
      },
      toxic: false,
    };
    const maxpps = config.dev ? 18 : 13;
    const minpps = 0.3;
    const maxAcceleration = 0.5;

    session.events.on("ready", async () => {
      // room update stuff first to grab room update on joining

      let lastRoomUpdate: RibbonEvents["room.update"] = null as any;

      // prevent anyone from forcing bot to play in invalid room config
      session.events.on("room.update.bracket", async (data) => {
        if (
          data.uid === session.user.id &&
          data.bracket === "player" &&
          !settings.enabled
        ) {
          settings.enabled = false;
          await session.room.switchSelfBracket("spectator");
          session.room.sendMessage(
            "Do not force bot into players bracket, instead, use the >enable command."
          );
        }
      });

      const settingHandler = new SettingsHandler();
      const frameManager = new FrameManager(session.sendMessage.bind(session));
      const targetingHandler = new TargetingHandler({
        frameManager,
        strategy: "payback",
      });

      session.events.on("room.update", (data) => {
        lastRoomUpdate = data;

        if (!settings.enabled) return;

        const res = settingHandler.checkRoomUpdate(data);
        if (res) {
          if (res.level !== "info") {
            session.room.switchSelfBracket("spectator");
            settings.enabled = false;
            res.outputs.forEach((output) => {
              session.room.sendMessage(
                `${output.level} level room config issue: ${output.message}. Current value for ${output.property}: ${output.value}`
              );
            });
          }
        }

        if (
          typeof targetingHandler !== "undefined" &&
          !data.options.manual_allowed &&
          targetingHandler.strategy === "manual"
        ) {
          targetingHandler.revertStrategy();
          session.room.sendMessage(
            `Reverted targeting strategy to ${targetingHandler.strategy} because manual targeting was disabled.\nTo re-enable manual, update the room config to allow manual targeting and run ">strategy manual"`
          );
        }
      });

      if ("joinRoom" in options) {
        if (typeof options.joinRoom !== "string") reject("joinRoom must be a string");
        if (options.joinRoom.length < 1) reject("joinRoom must be 1+ characters long");
        // not alphanumeric
        if (!/^[a-zA-Z0-9]+$/.test(options.joinRoom) && options.joinRoom !== "X-QP")
          reject(
            "joinRoom must be alphanumeric (failed to join " + options.joinRoom + ")"
          );
        try {
          await session.room.join(options.joinRoom.toUpperCase());
        } catch (e) {
          session.die(true);
          reject(e);
        }
      } else if ("createRoom" in options) {
        if (typeof options.createRoom === "string") {
          if (options.createRoom.length > 4 || options.createRoom.length < 1)
            reject("createRoom must be 1-4 characters long");
          // not alphanumeric
          if (!/^[a-zA-Z0-9]+$/.test(options.createRoom))
            reject("createRoom must be alphanumeric");
          if (!["public", "private", undefined, null].includes(options.type || "public"))
            reject("type must be public or private");
          log("Attempting to create room with type", options.type);
          await session.room.create(options.type || "private");
          log(
            "attempting to id room " + options.createRoom.toUpperCase() + ". Current id:",
            session.room.code
          );
          try {
            await session.room.updateId(options.createRoom.toUpperCase());
          } catch (e) {
            session.die(true);
            reject("Room id taken");
          }
        } else {
          await session.room.create(options.type || "private");
        }
      } else {
        reject("No room to create or join");
      }
      try {
        await session.room.switchSelfBracket("player");
      } catch (e) {
        session.room.sendMessage(
          "[Dingle Bot] Bot cannot enable because room is already full."
        );
      }

      let host = session.room.host as string;
      if (session.room.type === "public") {
        session.room.sendMessage(
          "Bot host only controls on by default because of public room. You can toggle them off with `>restrict`"
        );
        commands.restrict("host");
      }
      addRoom(session.room.code);
      session.events.on("room.addplayer", (data) => {
        if (host !== session.user.id) return;
        log(data.username, "has joined and will be made host");
        session.room.transferHost(data._id);
      });
      session.events.on("room.update.host", (data) => {
        host = data as unknown as string;
        if ((data as unknown as string) === session.user.id) {
          log("I am now host");
        }
      });
      session.events.on("room.chat", (data) => {
        if (data.user.username === session.user.username) return;
        const userData = {
          name: data.user.username,
          id: data.user._id,
          host: data.user._id === host,
          level:
            config.owner === data.user._id
              ? "owner"
              : config.admins.includes(data.user._id)
              ? "admin"
              : data.user._id === host
              ? "host"
              : ("off" as RestrictionLevel),
        };
        commands.applyMessage(userData, data.content, async (message) => {
          await session.room.sendMessage(message);
        });
      });

      session.room.sendMessage(
        `Bot is now online ${
          !config.dev ? `on worker ${process.env.WORKER_ID}` : "in dev mode"
        }. Run \`>help\` for a list of commands.\nHaving issues? Check out the discord server to ask for help: https://discord.gg/2MTQxEmpt6`
      );

      commands.on(["help"], ({ reply, args }) => {
        if (args.length === 0) {
          return reply(
            "Commands: help | settings (s) | enable (e) | disable (d) | restrict (r) | kill (k) | host (h) | toxic (t) | pps (p) | burst (b) | accelerate (a) |  manual (m) | strategy (st) | roomid | santa\nRun help <command> for more info on a specific command."
          );
        }

        const cmd = args[0];
        switch (cmd) {
          case "help":
            reply("no help for you");
            break;
          case "settings":
            reply(">settings - Displays current bot config");
            break;
          case "enable":
            reply(">enable - Enables bot gameplay (switches to player)");
            break;
          case "disable":
            reply(">disable - Disables bot gameplay (switches to spectator)");
            break;
          case "restrict":
            reply(">restrict - Toggles host only mode");
            break;
          case "kill":
            reply(">kill - Kills bot (bot leaves room). Only the host can run this.");
            break;
          case "host":
            reply(
              ">host - Takes host from the bot, if the bot is host. The room creator can take host back any time with the built-in /takehost command."
            );
            break;
          case "toxic":
            reply(">toxic - Toggle toxic mode.");
            break;
          case "pps":
            reply(
              `>pps <pps: number> - Sets the bot's target pieces per second. pps number must be greater than ${minpps} and less than ${maxpps}.`
            );
            break;
          case "burst":
            reply(
              `>burst <pps: number> - Sets the bot's burst speed. Burst number must be greater than ${minpps} and less than ${maxpps}.\nUse >burst off to turn off`
            );
            break;
          case "accelerate":
            reply(
              `>accelerate <acceleration: number> - Sets the pps acceleration - increase by value every second (linear). Suggested value: .016. Acceleration number must be greater than 0 and less than ${maxAcceleration}.\nUse >accelerate off to turn off.\nNote that acceleration does not affect burst speed.`
            );
            break;
          case "manual":
            reply(
              ">manual <players: string[]> - Set the bot's manual targets. Overrides strategy."
            );
            break;
          case "strategy":
            reply(
              ">strategy <strategy: even | elims | random | payback | manual> - Set the bot's targeting strategy. Manual only works if targets have been already set"
            );
            break;
          case "santa":
            reply(">santa - engage the festive spirit");
            break;
          default:
            reply(`Command ${cmd} not found`);
        }
      });

      commands.on(["santa"], ({ reply, user }) => {
        if (user.name.toLowerCase() === "sin90equals1") {
          settings.gameplay.pps = maxpps;
          if (lastRoomUpdate.options.manual_allowed) {
            targetingHandler.targets = [user.id];
          }
          return reply("a gift for you: 69420 spike");
        }
        reply(settings.toxic ? "he he he haw" : "ho ho ho");
      });

      commands.on(["host", "h"], ({ reply, user }) => {
        if (host !== session.user.id) return reply("Bot is not host");
        session.room.transferHost(user.id);
        reply(`${user.name} is now host.`);
      });

      commands.on(
        ["enable", "e"],
        async ({ reply }) => {
          const res = settingHandler.checkRoomUpdate(lastRoomUpdate);
          if (res) {
            res.outputs.forEach((output) => {
              session.room.sendMessage(
                `${output.level} level room config issue: ${output.message}. Current value for ${output.property}: ${output.value}`
              );
            });
            if (res.level === "error") {
              reply("Bot can not enable due to invalid room config for bot");
              return;
            }
          }
          try {
            settings.enabled = true;
            await session.room.switchSelfBracket("player");
            reply("Enabled bot gameplay");
          } catch (e) {
            reply("Bot cannot enable because room is already full.");
          }
        },
        true
      );

      commands.on(
        ["disable", "d"],
        async ({ reply }) => {
          try {
            await session.room.switchSelfBracket("spectator");
            settings.enabled = false;
          } catch (e) {
            session.room.sendMessage(`Error: ${e}`);
          }
          reply("disabled bot gameplay");
        },
        true
      );

      commands.on(
        ["restrict", "r"],
        async ({ user, reply, args }) => {
          if (!user.host && !config.admins.includes(user.id))
            return reply(`@${user.name} You are not the host`);

          if (
            args.length &&
            !(config.admins.includes(user.id) || config.owner === user.id)
          )
            return reply(`@${user.name} You don't have access to this feature.`);
          if (args.length && args[0] && args[0].length > 0) {
            if (!["off", "host", "admin", "owner"].includes(args[0]))
              return reply(`Invalid restriction level: ${args[0]}`);

            if (args[0] === "owner" && config.owner !== user.id)
              return reply(`Only haelp can do this.`);
            commands.restrict(args[0] as RestrictionLevel);

            return reply(`Restriction level now set to ${commands.restriction}`);
          } else {
            commands.restrict(commands.restriction === "off" ? "host" : "off");

            return reply(
              `Restrictions now ${commands.restriction === "off" ? "off" : "on"}`
            );
          }
        },
        true
      );

      commands.on(
        ["toxic", "t"],
        async ({ reply }) => {
          settings.toxic = !settings.toxic;
          return reply(`Toxic mode now ${settings.toxic ? "on" : "off"}`);
        },
        true
      );

      commands.on(
        ["pps", "p"],
        ({ reply, args: [arg], user }) => {
          if (!arg)
            return reply("Missing pps argument. Run `>help pps` for more information.");
          else {
            const pps = parseFloat(arg);
            if (!pps || pps < minpps)
              return reply(`Invalid pps (not a number or less than ${minpps} )`);
            if (pps > maxpps && !config.admins.includes(user.id))
              return reply(`Invalid pps (greater than ${maxpps}).`);
            settings.gameplay.pps = pps;
            return reply(`Set pps to ${arg}`);
          }
        },
        true
      );

      commands.on(
        ["burst", "b"],
        ({ reply, args: [arg], user }) => {
          if (!arg)
            return reply(
              "Missing burst argument. Run `>help burst` for more information."
            );
          else {
            if (arg === "off") {
              settings.gameplay.burst = 1;
              return reply("Burst is now off");
            }
            const burst = parseFloat(arg);
            if (!burst || burst < 0)
              return reply("Invalid burst speed (must be number >= 0)");
            if (burst > maxpps && !config.admins.includes(user.id))
              return reply(`Invalid burst (greater than ${maxpps}).`);
            settings.gameplay.burst = burst;
            return reply(`Set burst speed to ${arg}`);
          }
        },
        true
      );
      commands.on(
        ["accelerate", "a"],
        ({ reply, args: [arg] }) => {
          if (!arg)
            return reply(
              "Missing acceleration argument. Run `>help accelerate` for more information."
            );
          else {
            if (arg === "off" || parseFloat(arg) === 0) {
              settings.gameplay.acceleration = 1;
              return reply("Acceleration is now off");
            }
            const acceleration = parseFloat(arg);
            if (!acceleration || acceleration < 0)
              return reply("Invalid acceleration speed (must be number >= 0)");
            if (acceleration > maxAcceleration)
              return reply(`Invalid acceleration (greater than ${maxAcceleration}).`);
            settings.gameplay.acceleration = acceleration;
            return reply(`Set acceleration speed to ${arg}`);
          }
        },
        true
      );

      commands.on(
        ["garbageholesize"],
        ({ reply, args: [arg] }) => {
          if (session.user.id !== host) return reply("Bot is not host");
          session.sendMessage({
            command: "room.setconfig",
            data: [{ index: "options.garbageholesize", value: arg }],
          });

          reply("Set garbage hole size to " + arg);
        },
        true
      );

      commands.on(["settings", "s"], async ({ reply }) => {
        return reply(
          ` - pps: ${settings.gameplay.pps}\n - burst: ${
            settings.gameplay.burst === 1 ? "off" : settings.gameplay.burst
          }\n - targeting strategy: ${targetingHandler.strategy}\n - manual targets: ${
            targetingHandler.targets.length === 0
              ? "none"
              : targetingHandler.targets
                  .map(
                    (id) =>
                      session.room.players.find((player) => player._id === id).username
                  )
                  .join(", ")
          }\n - restricted mode: ${commands.restriction}\n - toxic mode: ${
            settings.toxic ? "on" : "off"
          }`
        );
      });

      commands.on(["debug"], async ({ reply }) => {
        return reply(`- machine id: ${process.env.MACHINE_ID || "unknown"}`);
      });

      commands.on(
        ["manual", "m"],
        async ({ reply, args }) => {
          if (!lastRoomUpdate.options.manual_allowed) {
            reply(
              "Manual targeting is not enabled in the room settings. Please enable manual targeting first."
            );
          }
          if (args.length === 0) {
            reply(
              "Manual targets required (none given). To disable manual targeting, use the >strategy command"
            );
          } else if (args[0] === "all") {
            targetingHandler.targets = session.room.players
              .filter((player) => player._id !== session.user.id)
              .map((player) => player._id);
          } else {
            // @ts-ignore
            args = [...new Set<string>(args)];
            const validUsers = args.filter(
              (player) =>
                session.room.players.map((player) => player.username).includes(player) &&
                player !== session.user.username
            );
            const invalidUsers = args.filter(
              (player) =>
                !session.room.players.map((player) => player.username).includes(player) ||
                player === session.user.username
            );

            if (validUsers.length === 0) {
              return reply(
                "No valid users provided, no changes made. Invalid users provided: " +
                  invalidUsers.join(", ")
              );
            } else {
              targetingHandler.targets = validUsers.map(
                (user) =>
                  session.room.players.find((player) => player.username === user)._id
              );
              if (invalidUsers.length > 0) {
                return reply(
                  "Updated manual targets, with the following invalid exceptions: " +
                    invalidUsers.join(", ")
                );
              } else {
                return reply("Updated manual targets.");
              }
            }
          }
        },
        true
      );

      commands.on(["strategy", "st"], ({ reply, args }) => {
        if (args.length === 0) {
          return reply("Please specify a strategy.");
        }
        if (args[0] === "manual" && targetingHandler.targets.length === 0) {
          return reply(
            'Can not set targeting strategy to manual without specifying manual targets first. Run ">help manual" for more information.'
          );
        } else if (![...Object.keys(strategyMap), "manual"].includes(args[0])) {
          return reply(
            `"${args[0]}" is an invalid targeting strategy. Valid options: ${[
              ...Object.keys(strategyMap),
              "manual",
            ].join(", ")}.`
          );
        } else if (args[0] === "manual" && !lastRoomUpdate.options.manual_allowed) {
          return reply(
            "Can not enable manual targeting because manual targeting is not currently allowed."
          );
        } else {
          targetingHandler.strategy = args[0] as any;
          return reply("Set strategy to " + args[0] + ".");
        }
      });

      commands.on(
        ["kill"],
        async ({ reply }) => {
          reply("killed bot");
          await session.room.leave();
          try {
            await session.die(true);
            session = {} as any;
          } catch (e) {}
          killListeners.forEach((kill) => kill());
        },
        true
      );

      let flaggerOn = false;

      commands.on(["important"], async ({ reply, user }) => {
        if (!config.testUsers.includes(user.id)) {
          return reply("You are not on the test user list, you cannot run this command.");
        }
        flaggerOn = !flaggerOn;
        return reply("Next game will be flagged as important");
      });

      commands.on(
        ["say"],
        async ({ reply, args, user }) => {
          if (!config.admins.includes(user.id))
            return reply("You are not an admin, you can't use this command.");
          session.room.sendMessage(args.join(" "));
        },
        true
      );

      const timeouts = {
        playPiece: null as NodeJS.Timeout | null,
        ping: null as NodeJS.Timeout | null,
        targetSwitch: null as NodeJS.Timeout | null,
      };

      const clearTimeouts = () =>
        Object.keys(timeouts).forEach((timeout) => clearTimeout(timeouts[timeout]));

      commands.on(
        ["roomid", "id", "room"],
        async ({ reply, args: [arg] }) => {
          if (profanity.isProfane(arg)) return reply("Please don't.");
          try {
            await session.room.updateId(arg.toUpperCase());
            reply("Set room id to " + arg.toUpperCase());
          } catch (e) {
            reply(e as any);
          }
        },
        true
      );

      session.events.on("room.removeplayer", (data) => {
        if (session.room.players.length <= 1) {
          log(`empty room, leaving ${session.room.code}`);
          killListeners.forEach((kill) => kill());
          session.die(true);
        }

        const playerIndex = session.room.players.findIndex(
          (player) => player._id === data
        );
        playerIndex >= 0 && session.room.players.splice(playerIndex);

        if (targetingHandler.targets.includes(data)) {
          const copy = [...targetingHandler.targets];
          copy.splice(copy.indexOf(data), 1);
          targetingHandler.targets = [...copy];
          if (targetingHandler.targets.length <= 0) {
            targetingHandler.revertStrategy();
            session.room.sendMessage(
              `Reverted targeting strategy to ${targetingHandler.strategy} because all manual targets have left the room.`
            );
          }
        }

        const ownerInRoom =
          session.room.players.filter((player) => player._id === config.owner).length >=
          1;

        const adminInRoom =
          session.room.players.filter((player) => config.admins.includes(player._id))
            .length >= 1;

        if (commands.restriction === "owner" && !ownerInRoom) {
          commands.restriction = "host";
          session.room.sendMessage("Owner left, restriction level changed to host.");
        } else if (commands.restriction === "admin" && !adminInRoom && !ownerInRoom) {
          commands.restriction = "host";
          session.room.sendMessage("All admins left, restriction level changed to host.");
        }
      });

      const printPieces = false && process.env.MODE !== "production";

      let round = 1;
      let igeHandlerID = 0;
      let currentTargets: string[] = [];
      let gameStart = 0;

      session.events.on("game.ready", async (gameReadyData) => {
        let pieces = 0;
        if (round === 1) {
          gameStart = performance.now();
        }
        let selfGameOver = false;

        const selfGameData = gameReadyData.players.find(
          (player) => player.userid === config.self
        );

        if (!selfGameData) {
          return;
        }

        currentTargets = [];
        // this must be first to prevent duplicate listeners and bot getting banned
        const tempListeners: [string, Function][] = [];
        let gameEnded = false;

        const proxyListener =
          (callback: Function) =>
          (...data: any[]) => {
            if (!gameEnded) {
              callback(...data);
            }
          };

        const listen = ((event: any, callback: any) => {
          if (gameEnded) {
            // no add listener cause no game to listen
          } else {
            const listener = proxyListener(callback);

            session.events.on(event, listener);
            tempListeners.push([event, listener]);
          }
        }) as typeof session.events.on;

        const listenOnce = ((event: any, callback: any) => {
          if (gameEnded) {
            // no add listener cause no game to listen
          } else {
            const listener = proxyListener(callback);
            session.events.once(event, listener);
            tempListeners.push([event, listener]);
          }
        }) as typeof session.events.once;

        frameManager.clear();

        if (round === 1)
          session.room.sendMessage(settings.toxic ? "bad luck have fun :woke:" : "glhf!");
        const rng = bag7(selfGameData.options.seed);
        const queue = [...rng(), ...rng()];
        const id = selfGameData.gameid;
        const gameID = id.replace(session.user.id, "");
        frameManager.gameID = id;
        let bgm: string;

        listenOnce("room.update", (data) => {
          bgm = data.bgm;
        });

        const bot = new ColdClear();

        const engineConfig: EngineInitializeParams = {
          board: {
            width: selfGameData.options.boardwidth,
            height: selfGameData.options.boardheight,
            buffer: selfGameData.options.boardbuffer,
          },
          kickTable: selfGameData.options.kickset as any,
          options: {
            b2bChaining: selfGameData.options.b2bchaining,
            comboTable: selfGameData.options.combotable as any,
            garbageBlocking: selfGameData.options.garbageblocking as any,
            garbageMultiplier: {
              value: selfGameData.options.garbagemultiplier,
              increase: selfGameData.options.garbageincrease,
              marginTime: selfGameData.options.garbagemargin,
            },
            garbageTargetBonus: "none",
            spinBonuses: "T-spins",
            garbageAttackCap: Infinity,
          },
          queue: {
            minLength: 10,
            seed: selfGameData.options.seed,
            type: selfGameData.options.bagtype as any,
          },

          garbage: {
            cap: {
              absolute: Infinity,
              increase: selfGameData.options.garbagecap,
              max: selfGameData.options.garbagecapmax,
              value: selfGameData.options.garbagecap,
            },
            speed: selfGameData.options.garbagespeed,
          },
        };

        const logger = new GameLogger(
          id,
          gameReadyData.players
            .map((player) => player.options.username)
            .filter((player) => player !== session.user.username),
          engineConfig,
          round,
          flaggerOn
        );

        const playersInGame = gameReadyData.players.filter(
          (user) => user.userid !== session.user.id
        );

        const removePlayerListener = (data: { data: string }) => {
          for (let player of playersInGame) {
            if (player.userid.includes(data.data)) {
              playersInGame.splice(
                playersInGame.findIndex((p) => p.userid.includes(data.data)),
                1
              );
              break;
            }
          }
        };
        listen("room.removeplayer", removePlayerListener);

        const igeMessageHandler = new IGEMessageHandler(igeHandlerID, id, frameManager);

        const handleIGECallback = (data: IGEMessage[]) => {
          if (igeMessageHandler.id !== igeHandlerID) return;
          return igeMessageHandler.handleIGEMessage.bind(igeMessageHandler)(data);
        };
        listen("game.ige", handleIGECallback);

        igeMessageHandler.on("target", ([message]) => {
          currentTargets = message.data.targets;
        });

        listenOnce("game.match", () => {
          gameReadyData.players.forEach((player) => {
            session.sendMessage({
              command: "game.scope.start",
              data: player.gameid,
            });
          });
          listenOnce("game.start", async () => {
            config.dev && log("game ready");

            listenOnce("replay", () => {
              frameManager.start(id);

              const start = startEvent({
                gameID: id,
                seed: selfGameData.options.seed,
                pieces: queue,
                options: selfGameData.options,
                bgm,
                fulloffset: selfGameData.options.fulloffset,
                fullinterval: selfGameData.options.fullinterval,
                username: session.user.username as string,
                handling,
                // first non-self player in gameMatchData.leaderboard
                targets: [],
              });

              frameManager.push(id, ...start);
              targetingHandler.start(id, gameID);
              const fps = 60;

              const igeHandler = new IGEHandlerV2(
                playersInGame.map((player) => player.gameid),
                frameManager.frame.bind(frameManager)
              );

              // @ts-ignore
              const getCurrentGravity = () =>
                calculateIncrease(
                  selfGameData.options.g,
                  frameManager.frame(),
                  selfGameData.options.gincrease,
                  selfGameData.options.gmargin
                );

              // 10 frames each ping, in ms
              const pingGap = (1000 / fps) * 10;
              const gameStart = performance.now();
              let piecesPlaced = 0;

              const beforePing = () => {
                clearTimeout(timeouts.ping as any);
                timeouts.ping = setTimeout(() => {
                  session.sendMessage({
                    command: "replay",
                    data: {
                      id,
                      silent: [],
                    },
                  });
                  beforePing();
                }, pingGap);
              };

              igeMessageHandler.on("interaction_confirm", ([message, frame]) => {
                if (message.data.data.type === "targeted") {
                  // pass idk what to do yet
                } else {
                  const amount = igeHandler.recieveGarbage(
                    message.data.gameid,
                    message.data.data.ackiid,
                    message.data.data.iid,
                    message.data.data.amt
                  );

                  logger.pushState({
                    type: "garbage",
                    amount: message.data.data.amt,
                    column: message.data.data.column,
                    size: message.data.data.size,
                    frame,
                  });

                  engine.recieveGarbage({
                    amount: amount,
                    column: message.data.data.column,
                    size: message.data.data.size,
                    frame,
                  });

                  // we try to do the stuff
                  if (!selfGameOver) {
                    const timeoutMS = getPieceTimeout();
                    clearTimeout(timeouts.playPiece);

                    timeouts.playPiece = setTimeout(playPiece, Math.max(0, timeoutMS));
                  }
                }
              });

              igeMessageHandler.on("kev", ([message]) => {
                if (message.data.victim.gameid === id) {
                  // we dead
                  if (settings.toxic) session.room.sendMessage("misclick oops");
                  clearTimeout(timeouts.playPiece);
                }
                const index = playersInGame.findIndex(
                  (player) => player.gameid === message.data.victim.gameid
                );
                if (index > -1) {
                  playersInGame.splice(index, 1);
                }
              });

              const kevListener = ({ frames }: { frames: IGEKevFrame[] }) => {
                frames.forEach((frame) => {
                  if (
                    frame &&
                    frame.data &&
                    frame.data.type === "ige" &&
                    frame.data.data &&
                    frame.data.data.type === "kev"
                  ) {
                    const index = playersInGame.findIndex(
                      (player) => player.gameid === frame.data.data.victim.gameid
                    );
                    if (index > -1) {
                      if (settings.toxic) {
                        session.room.sendMessage(
                          "imagine dying " + playersInGame[index].options.username
                        );
                      }
                      playersInGame.splice(index, 1);
                    }
                  }
                });
              };

              listen("replay", kevListener);

              const click = (
                key: keyof typeof moveMap,
                frame: number,
                index: number,
                total: number
              ) => {
                return [
                  {
                    frame,
                    type: "keydown",
                    data: { key: moveMap[key], subframe: index / total },
                  },
                  {
                    frame: frame,
                    type: "keyup",
                    data: {
                      key: moveMap[key],
                      subframe: index / total + 0.000001,
                    },
                  },
                ];
              };

              const moveMap = {
                left: "moveLeft",
                right: "moveRight",
                soft: "softDrop",
                hard: "hardDrop",
                hold: "hold",
                cw: "rotateCW",
                ccw: "rotateCCW",
                "180": "rotate180",
              };

              const engine = new Engine(engineConfig);

              engine.onQueuePieces((pieces) => {
                bot.addPieces(...pieces);
              });

              const keys = {
                left: engine.moveLeft.bind(engine),
                right: engine.moveRight.bind(engine),
                cw: engine.rotateCW.bind(engine),
                ccw: engine.rotateCCW.bind(engine),
                "180": engine.rotate180.bind(engine),
                soft: engine.softDrop.bind(engine),
              };

              bot.start({ queue: queue as any, board: engine.board.state });
              let lastFrame = 0;

              const getPieceTimeout = () => {
                const boardTop = Math.max(
                  0,
                  JSON.parse(JSON.stringify(engine.board.state)).findIndex(
                    (row: (string | null)[]) => {
                      return row.every((block) => block === null);
                    }
                  ) - 1
                );
                const boardHeight = engine.board.height;
                const millisecondsSinceStart = performance.now() - gameStart;

                if (
                  boardTop + engine.garbageQueue.size >=
                  boardHeight - settings.gameplay.burstBuffer
                ) {
                  return getStaticMSTillNextPiece(
                    settings.toxic ? maxpps : settings.gameplay.burst
                  );
                }
                return getMSTillNextPiece({
                  pieces: piecesPlaced,
                  pps: settings.gameplay.pps * (settings.toxic ? 2 : 1),
                  time: millisecondsSinceStart,
                  acceleration: settings.gameplay.acceleration,
                  min: settings.gameplay.pps * (1 - settings.gameplay.ppsMaxChange),
                  max: settings.toxic
                    ? Infinity
                    : settings.gameplay.pps * (1 + settings.gameplay.ppsMaxChange),
                  cap: maxpps,
                });
              };

              const generateNextMove = async (frame: number) => {
                engine.frame = frame;
                const doStuff = async () => {
                  const engineStart = performance.now();
                  const move = await bot.suggest();
                  console.log("engine time:", performance.now() - engineStart);

                  printPieces && log("-------------------");
                  printPieces && move.spin !== "none" && log(move.spin);
                  printPieces &&
                    bot.printBoard(
                      JSON.parse(JSON.stringify(engine.board.state)).reverse()
                    );
                  const boardState = JSON.parse(JSON.stringify(engine.board.state));
                  const garbageState = deepCopy(engine.garbageQueue.queue) as Garbage[];

                  let doesHold = false;
                  if (
                    engine.falling.symbol.toLowerCase() !==
                    move.location.type.toLowerCase()
                  ) {
                    engine.hold();
                    doesHold = true;
                  }

                  const rotation = bot.rotationFromDirection(move.location.orientation);
                  const blocks = bot.rotate(move.location.type as Piece, rotation);
                  const positions = blocks.map((block) => [
                    block[0] + move.location.x,
                    block[1] + move.location.y,
                  ]);

                  const start = performance.now();
                  const res = engine.bfs(5, positions as any);
                  console.log("piece calculation time:", performance.now() - start);
                  if (res === false) {
                    console.error(
                      "failed to find keys for rotation",
                      rotation,
                      "and blocks",
                      blocks.map((block) => `(${block[0]}, ${block[1]})`).join(", "),
                      "(resulting in positions:",
                      positions.map((block) => `(${block[0]}, ${block[1]})`).join(", "),
                      ")",
                      "current garbage:",
                      engine.garbageQueue.size,
                      "current piece:",
                      engine.falling.symbol
                    );
                    return false;
                  }

                  res.forEach((key) => keys[key as any]());
                  const finalRes = engine.hardDrop();

                  if (finalRes.garbageAdded) {
                    printPieces && bot.printBoard(deepCopy(engine.board.state).reverse());
                    bot.stop();
                    bot.start({
                      queue: [engine.falling.symbol, ...engine.queue.value],
                      board: deepCopy(engine.board.state),
                      hold: engine.held,
                      combo: Math.max(engine.stats.combo, 0),
                      backToBack: engine.stats.b2b === -1 ? false : true,
                    });
                  }

                  let linesCountered = 0;
                  return {
                    ...move,
                    keys: [...res, "hard"],
                    clearedLines: finalRes.lines,
                    info: {
                      board: boardState,
                      garbage: garbageState,
                      lines: finalRes.sent,
                      linesCountered,
                    },
                    hold: doesHold,
                  };
                };
                try {
                  return await doStuff();
                } catch (e) {
                  setTimeout(
                    () =>
                      !gameEnded &&
                      session.room.sendMessage(
                        "Engine crashed, waiting for next round/game"
                      ),
                    1000
                  );
                  selfGameOver = true;
                  return false;
                }
              };

              const playPiece = async () => {
                try {
                  let frame = frameManager.frame();
                  frameManager.stall();

                  if (frame <= lastFrame) {
                    frame = lastFrame + 1;
                  }
                  const finalActions: any[] = [];

                  const moves = await generateNextMove(frame);
                  if (!moves) return;

                  const pressedKeys: string[] = [];
                  if (moves.hold) {
                    pressedKeys.push("hold");
                  }

                  pressedKeys.push(...moves.keys);

                  for (let i = pressedKeys.length - 1; i >= 0; i--) {
                    if (pressedKeys[i] === "soft") {
                      pressedKeys.splice(
                        i,
                        0,
                        ...Array<string>(engine.board.height + 5).fill("soft")
                      );
                    }
                  }

                  printPieces && log(pressedKeys.join(", "), "at frame", frame);

                  logger.pushState({
                    frame,
                    location: moves.location,
                    type: "key",
                  });

                  pressedKeys.forEach((key, index) => {
                    finalActions.push(
                      ...click(key as any, frame, index, pressedKeys.length)
                    );
                  });
                  lastFrame = frame;
                  piecesPlaced++;
                  pieces++;

                  queue.shift();

                  frameManager.push(id, ...finalActions);
                  frameManager.unstall();

                  if (moves.info.lines > 0) {
                    if (moves.info.lines - moves.info.linesCountered >= 1) {
                      if (!currentTargets || currentTargets.length < 1)
                        console.error("No target given by server 💀");
                      try {
                        currentTargets.forEach((target) =>
                          igeHandler.sendGarbage(
                            target,
                            moves.info.lines - moves.info.linesCountered
                          )
                        );

                        targetingHandler.newRandomTarget();
                      } catch (e) {
                        console.error(e);
                      }
                    }
                  }

                  beforePing();

                  const timeoutMS = getPieceTimeout();

                  timeouts.playPiece = setTimeout(playPiece, Math.max(0, timeoutMS));
                } catch (e) {
                  console.error(e);
                  throw e;
                }
              };

              timeouts.playPiece = setTimeout(playPiece, 1000 / settings.gameplay.pps);
            });
          });
        });

        const onGameEnd = (event: "end" | "abort" | "score") => (data: any) => {
          const saygg = event === "end";
          if (gameEnded) return;
          gameEnded = true;
          if (data && data.victor && data.leaderboard && !data.currentboard) round++;
          else {
            round = 1;
          }

          if (config.dev) log("game over");
          tempListeners.forEach(([k, v]) => session.events.off(k, v as any));
          clearTimeouts();
          bot.stop();
          bot.quit();
          frameManager.stop();
          saygg && session.room.sendMessage(settings.toxic ? "L" : "gg");
          logger.uploadToCloud();
          addPieces(pieces);
          if (saygg) {
            const infos: GameEndData = data;
            afterGame(
              gameReadyData.players
                .filter((player) => player.userid !== session.user.id)
                .map((player) => player.userid),
              performance.now() - gameStart,
              infos.leaderboard[0].id
            );
          }
        };
        listenOnce("game.end", onGameEnd("end"));
        listenOnce("game.abort", onGameEnd("abort"));
        listenOnce("game.score", onGameEnd("score"));
      });

      let dead = false;
      const deadListener = () => {
        if (dead) return;
        killListeners.forEach((kill) => kill());
        try {
          session.die(true);

          clearTimeouts();
          dead = true;
        } catch (e) {}
      };
      session.events.on("room.leave", deadListener);
      session.events.on("dead", deadListener);

      resolve({
        kill: () => {
          session.sendMessage({
            command: "room.leave",
          });
          session.die(true);
          killListeners.forEach((kill) => kill());

          return;
        },
        session: () => session,
        onConnect: (cb: () => void) => {
          session.events.on("ready", cb);
        },
        room: () => session && session.room,
        awaitReady: new Promise<void>((resolve) => {
          session.events.on("ready", () => {
            resolve();
          });
        }),
        onKill: (cb: () => void) => {
          killListeners.push(cb);
        },
      });
    });
    const killListeners: (() => void)[] = [];

    session.events.on("error", (data) => {
      false && log("Error:", data);
    });

    process.on("SIGTERM", () => {
      const room = session.room.code;
      log("gracefully shutting down from SIGTERM");
      session.room.sendMessage(
        session.user.username + " just got an update, restarting server to bring new features and bugfixes!"
      );
      session.events.once("dead", () => {
        log("disconnected from", room);
      });
      try {
        session.die(true);
        if (session.session.dead) {
          log("disconnected from", room);
        }

        killListeners.forEach((kill) => kill());
      } catch {}
    });
    process.on("SIGINT", async () => {
      const room = session && session.room ? session.room.code : "(unknown)";
      log("gracefully shutting down from SIGINT (Crtl-C)");
      session.events.once("dead", () => {
        log("disconnected from", room);
        process.exit();
      });
      try {
        await session.die(true);
        if (session.session.dead) {
          log("disconnected from", room);
          process.exit();
        }

        // fail-safe
        setTimeout(() => {
          log("force disconnected from", room);
          process.exit();
        }, 2000);

        killListeners.forEach((kill) => kill());
      } catch {}
    });

    process.on("uncaughtException", (error) => {
      if (error.message.includes("EPIPE")) {
        // ignore yay
        log("bypass EPIPE");
      } else {
        killListeners.forEach((kill) => kill());

        // For other errors, it's a good practice to log them and gracefully exit
        console.error("Uncaught Exception:", error);
        throw error;
      }
    });

    session.connect();
  });
}
