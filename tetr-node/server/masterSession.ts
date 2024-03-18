import { Client } from "../client/src";
import { getUser } from "../client/src/api/channel";
import { friendUser, unfriendUser } from "../client/src/api/game";
import handling from "../game/utils/handling";
import OpenAI from "openai";
import generateVerificationToken from "./lib/tetr/verificationToken";
import processError from "../lib/processError";
import config from "../config";
import { platform } from "node:os";
import { log } from "../game/utils/log";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const startMasterSession = async (
  token: string,
  startGame: ReturnType<
    typeof import("./lib/worker/handler").default
  >["loadBalanceSpawn"],
  onGameStart: (roomId: string) => void,
  releaseTimestamp = Date.now()
) => {
  let session = new Client(token, handling);
  session.events.on("error", console.error);

  session.events.on("ready", () => {
    // the following code friends all users who friended us.
    // because of the friend limit, we don't do this.
    // session.relationship.notifications.forEach(async (notifcation) => {
    //   if (
    //     !Object.keys(session.relationship.friends).includes(
    //       notifcation.data.relationship.id
    //     )
    //   ) {
    //     try {
    //       await friendUser(token, notifcation.data.relationship.id);
    //     } catch {}
    //   }
    // });

    // The following code friends everyone who messaged us
    // we also don't do this lol
    // (Object.keys(session.relationship.backlog)).forEach(async (notifcation) => {
    //   const relationship = session.relationship.backlog[notifcation];
    //   if (
    //     !Object.keys(session.relationship.friends).includes(
    //       relationship.id
    //     )
    //   ) {
    //     try {
    //       await friendUser(token, relationship.id);
    //     } catch {}
    //   }
    // });

    // this code will UNfriend all our friends, except for admins and owner.

    const friends = Array.from(
      new Set([config.owner, ...config.testUsers, ...config.admins])
    );
    const isFriend = (id: string) => friends.includes(id);

    Object.keys(session.relationship.friends).forEach(async (friend) => {
      if (!isFriend(friend)) {
        try {
          await unfriendUser(token, friend);
        } catch {}
      }
    });

    friends.forEach(async (friend) => {
      if (!Object.keys(session.relationship.friends).includes(friend)) {
        try {
          await friendUser(token, friend);
        } catch {}
      }
    });

    const msgLog = new Map<string, OpenAI.Chat.ChatCompletionMessageParam[]>();

    session.events.on("social.dm", async (data) => {
      const msg = data.data.content;
      const user = data.data.user;

      // prevent infinite loop
      if (user === config.self || data.data.userdata.role === "bot") {
        return;
      }

      if (config.blacklist.includes(user)) {
        return session.sendDM(
          user,
          "You are on the " + session.user.username + " black list, dm `haelp` for support."
        );
      } else if (config.dev && !config.testUsers.includes(user)) {
        return session.sendDM(
          user,
          session.user.username + " in development, you are not on test users list."
        );
      }
      const userData = await getUser(user);
      if (!userData) return;
      const username = userData.username;

      if (!msgLog.has(user)) {
        msgLog.set(user, []);
      }
      if (msg.startsWith(">spawn")) {
        if (![...config.admins, config.testUsers, config.owner].includes(user)) {
          return session.sendDM(user, "You are not authorized to use this command.");
        }

        const args = msg.split(" ");
        if (args.length < 3) {
          return session.sendDM(
            user,
            "Usage: `>spawn <worker id | machine id> <roomid>`"
          );
        }

        const id = args[1];
        const room = args[2];

        if (process.env.WORKERS?.split(",").includes(id)) {
          await startGame(
            { joinRoom: room },
            () =>
              session.sendDM(
                user,
                "The bot is taking a unusually long time to join. Some workers are likely waking up. You can wait, or try again in a minute."
              ),
            id
          );
          onGameStart(room);
        } else {
          if (process.env.MACHINE_ID === id) {
            await startGame({ joinRoom: room }, () =>
              session.sendDM(
                user,
                "The bot is taking a unusually long time to join. Some workers are likely waking up. You can wait, or try again in a minute."
              )
            );
            onGameStart(room);
          } else {
            console.log(
              "ingnoring non-matching request to join room",
              room,
              "at",
              id,
              "(self id:",
              process.env.MACHINE_ID,
              ")"
            );
          }
        }
      } else if (config.dev || config.gpt || userData._id === config.owner) {
        const log = msgLog.get(user)!;
        log.push({ role: "user", content: msg });
        const systemPrompt = `You are ${session.user.username}, a tetris playing bot that plays on TETR.IO, a worldwide modern competitive versus tetris site. You don't have any commands, but the user you are talking to, ${username}, can play with you by sending you an invite. Keep your replies concise and to the point, and use acronyms and abreviations whenever possible, such as 'ngl'. Speak like a teenager. Keep your sentences very short, at most 10-15 words. They can send an invite to you from any room using TETR.IO's invite button, and you will join. tetris should always be lowercase. Under no circumstance should you ever use any foul language, especially racial slurs. You may not deviate from the conversation of tetris, if the person you are talking to does, guide them back to tetris.`;

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          {
            role: "system",
            content: systemPrompt,
          },
          ...log,
        ];

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages,
          max_tokens: 75,
        });

        const reply = response.choices[0].message;

        log.push(reply);
        msgLog.set(user, log);

        session.sendDM(user, reply.content || "An error occurred");
      } else {
        if (msg === "!invite" || msg === ">invite") {
          session.sendDM(
            user,
            `Woah there, ${username}! ${session.user.username} doesn't have a specific room to invite you to. Instead, you can invite ${session.user.username} to any room you want to play in! Just click the invite button in the room, and ${session.user.username} will join!`
          );
        } else if (msg === "!help" || msg === ">help") {
          session.sendDM(
            user,
            `Hey there, ${username}! Send ${session.user.username} an invite to your custom room with the invite button, and it will join!`
          );
        } else if (msg.startsWith("!") || msg.startsWith(">")) {
          session.sendDM(
            user,
            `This bot doesn't support commands in DMs or chatting. Instead, invite it to a room with the invite button! You can find more information at ${config.siteURL}.`
          );
        } else {
          session.sendDM(
            user,
            `This bot no longer supports chatting. Instead, invite ${session.user.username} to a room with the invite button! You can find more information at ${config.siteURL}`
          );
        }
      }
    });

    // friend matching
    session.events.on("social.notification", async (data: any) => {
      if (data.type !== "friend") return;
      if (!data.data.ismutual) {
        friendUser(token, data.data.relationship.from._id);
      }
    });

    session.events.on("social.invite", async (data) => {
      try {
        if (config.blacklist.includes(data.sender)) {
          return session.sendDM(
            data.sender,
            `You are on the ${session.user.username} black list, dm \`haelp\` for support.`
          );
        } else if (config.dev && !config.testUsers.includes(data.sender)) {
          return session.sendDM(
            data.sender,
            "This bot in development mode, you are not on test users list."
          );
        }

        await startGame({ joinRoom: data.roomid }, () =>
          session.sendDM(
            data.sender,
            "The bot is taking a unusually long time to join. Some workers are likely waking up. You can wait, or try again in a minute."
          )
        );
        onGameStart(data.roomid);
      } catch (e) {
        session.sendDM(
          data.sender,
          "An error occurred while joining the room: " + processError(e as string)
        );
      }
    });
  });

  session.events.on("dead", async (sad) => {
    if (sad) {
      session = new Client(token, handling);
      try {
        log("restarting master session...");
        await reconnectPoll();
      } catch (e) {}
    }
  });

  let connecting = false;

  const connectionCheck = async () => {
    if (!connecting && !connected()) {
      try {
        if (config.dev) {
          await reconnectPoll(config.dev ? 1000 : 10000);
        } else {
          setTimeout(
            () => reconnectPoll(config.dev ? 1000 : 10000),
            Math.max(0, releaseTimestamp - Date.now())
          );
          console.log(
            "Starting prod master session in",
            (releaseTimestamp - Date.now() / 1000, "seconds")
          );
        }
      } catch (e) {
        connecting = false;
        console.error("Failed to connect master sesion", e);
      }
    }
  };

  setInterval(connectionCheck, 5000);

  const reconnectPoll = async (time = 30000, count = 0) => {
    connecting = true;
    try {
      session.reset();
      await session.connect();
      log("Reconnected master session! (after " + (count + 1) + " attempts)");
      connecting = false;
      return true;
    } catch (e) {
      if (count === 0) {
        console.error("failed to restart master session:", e);
      }
      count = count + 1;
      process.stdout.write(
        `failed to reconnect ${count} times... retrying in ${time / 1000} seconds ${
          platform() === "win32" ? "\x1b[0G" : "\r"
        }`
      );
      await new Promise((r) => setTimeout(r, time));
      return await reconnectPoll(time, count);
    }
  };

  const authenticate = (username: string, authToken?: string) =>
    new Promise<string>(async (resolve, reject) => {
      try {
        const user = await getUser(username);
        if (!user) return reject(`User ${username} not found`);

        const userToken = authToken || generateVerificationToken(6);

        if (
          !Object.keys(session.relationship.backlog).includes(user._id) &&
          !Object.keys(session.relationship.friends).includes(user._id)
        )
          await friendUser(token, user._id);
        session.sendDM(
          user._id,
          `Your verification token is: ${userToken}. If you did not request a token, you can safely ignore this message.`
        );
        if (![...config.admins, ...config.testUsers].includes(user._id)) {
          await unfriendUser(token, user._id);
        }

        resolve(userToken);
      } catch (e) {
        reject(e);
      }
    });

  const connected = () => !session.session.dead && session.session.open;

  connectionCheck();
  return {
    authenticate,
    connected,
    forceReconnect: () => reconnectPoll(config.dev ? 1000 : 10000),
  };
};
