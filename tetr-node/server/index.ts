import { Server } from "socket.io";
import { DiscordUser, RoomData, User } from "./types";
import getRooms from "../client/src/api/game/getRooms";
import express from "express";
import { join } from "node:path";
import getAccessToken from "./lib/discord/accessToken";
import { insert, query, update } from "../lib/mongodb";
import { generateToken } from "../lib/accounts/token";
import fetch from "node-fetch";
import authMiddleware from "./lib/tetr/middleware";
import cookieParser from "cookie-parser";
import { startMasterSession } from "./masterSession";
import { getUser } from "../client/src/api/channel";
import processError from "../lib/processError";
import config from "../config";
import { loadLog, loadLogs } from "../lib/logsHandler";
import { log } from "../game/utils/log";
import { isValidRoomID } from "../lib/roomID";
import { SpawnMessage } from "../worker";
import initializeWorkerHandler from "./lib/worker/handler";
import runBot from "../game";
import cors from "cors";
import {
  createAccount,
  getAccount,
  getGlobalStats,
  getUsers,
  updateAccountTetrio,
} from "../lib/accounts";
import { loadUpvotes, updateUpvotes } from "../lib/stats";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export default async function launchServer(
  token: string,
  port: string | number = process.env.PORT || 3000
) {
  const publicRooms: RoomData[] = [];
  const rooms: string[] = [];

  const authenticatedUsers = [];

  const workerHandler = initializeWorkerHandler();

  const releaseTimestamp = 1700671500000;
  const masterSession = startMasterSession(
    token,
    config.dev
      ? (((data: SpawnMessage) =>
          runBot(token, data)) as any as typeof workerHandler.loadBalanceSpawn)
      : workerHandler.loadBalanceSpawn,
    (room) => rooms.push(room),
    releaseTimestamp
  );

  const verificationTokens = new Map<string, string>();

  const app = express();
  const server = app.listen(parseInt(port as any), "0.0.0.0", () =>
    log(`Listening on port ${port}: http://localhost:${port}`)
  );

  if (process.env.MODE !== "production") {
    app.use(
      (req, _, next) =>
        // @ts-ignore
        (!req.url.includes("status") && log("Request from", req.url)) || next()
    );
  }
  // @ts-ignore
  app.use((req, res, next) => {
    if (req.url.includes("upvote") || req.url.includes("socket")) return next();
    return res.sendFile(join(__dirname, "./content/banned/index.html"));
  });
  app.use(cookieParser());
  app.use(express.json());
  app.use(authMiddleware);
  app.use((req, res, next) => {
    if (req.url === "" || req.url === "/") {
      const now = Date.now();
      if (now >= releaseTimestamp) {
        return res.sendFile(join(__dirname, "./content/root/index.html"));
      } else {
        next();
      }
    } else {
      next();
    }
  });
  app.use(express.static(join(__dirname, "./content")));
  app.use((req, res, next) => {
    if (
      req.url.includes("logs") ||
      req.url.includes("roomlist") ||
      req.url.includes("forcereconnect")
    ) {
      if (!req.user || !config.admins.includes(req.user.tetrio.id)) {
        return res.status(403).send("Unauthorized: not an admin").end();
      }
    }
    return next();
  });

  app.get("/roomlist", async (_, res) => {
    res.send(JSON.stringify(await workerHandler.fetchWorkerStatuses(), null, 2)).end();
  });

  app.get("/stats", async (_, res) =>
    getGlobalStats()
      .then((stats) => res.status(200).send(stats))
      .catch(() => res.status(500).send("An error occured"))
  );

  app.get("/users", async (_, res) =>
    getUsers()
      .then((users) => res.status(200).send(users))
      .catch(() => res.status(500).send("An error occured"))
  );

  app.get("/forcereconnect", async (_, res) => {
    if ((await masterSession).connected())
      return res.send("master session alr connected");
    else {
      (await masterSession).forceReconnect();
      return res.send("Reconnecting...");
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const upvotes = await loadUpvotes();

  setInterval(async () => {
    updateUpvotes(upvotes);
  }, 60000);

  io.on("connection", (socket) => {
    socket.emit("publicRooms", publicRooms);

    socket.on("upvote", async (options: { name: string; pfp: string }) => {
			if (!options || !options.name || !options.pfp) return;
			const { name, pfp } = options;
      if (!upvotes.find((upvote) => upvote[0] === name)) {
        upvotes.push([name, 1]);
      } else {
        upvotes.find((upvote) => upvote[0] === name)[1]++;
      }
      io.emit("upvote", { name, pfp });
    });

    socket.emit("upvotes", upvotes);

    socket.on("summon", async (room: string) => {
      // if (rooms.includes(room)) return socket.emit("error", "already in room");
      if (!isValidRoomID(room))
        return socket.emit(
          "error",
          "room code must be 1-16 alphanumeric characters long"
        );
      try {
        const code = await workerHandler.loadBalanceSpawn({ joinRoom: room });
        socket.emit("joined", code);
      } catch (e) {
        socket.emit("error", e);
      }
    });

    socket.on("create", async (isPublic = false, room?: string) => {
      try {
        const res = await workerHandler.loadBalanceSpawn({
          createRoom: room,
          type: isPublic ? "public" : "private",
        });
        socket.emit("created", res);
      } catch (e) {
        return socket.emit("error", processError(e));
      }
    });
  });

  const scrapeRooms = async () => {
    try {
      const newRooms = (await getRooms(token)).map((room) => ({
        ...room,
        botInRoom: rooms.includes(room.id),
      }));
      publicRooms.splice(0, publicRooms.length, ...newRooms);
      io.emit("publicRooms", publicRooms);
    } catch (e) {
      log("failed to scrape rooms oof");
    }
  };

  // setInterval(scrapeRooms, 500);
  scrapeRooms();

  log("ready");

  // discord oauth stuff
  app.get("/oauth", async (req, res) => {
    const code = req.query.code as string;

    const access = await getAccessToken(code);
    const token = access.access_token;

    const discord = (await (
      await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `${access.token_type} ${token}`,
        },
      })
    ).json()) as DiscordUser;
    if ((await query("users", { discord: discord.id })).length > 0) {
      const userToken = generateToken();
      update(
        "users",
        { discord: { id: discord.id } },
        {
          $set: {
            token: userToken,
            discord: {
              id: discord.id,
              name: discord.username,
              avatar: `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`,
              accessToken: access.access_token,
              refreshToken: access.refresh_token,
            },
          },
        }
      );

      res.cookie("token", userToken, {
        maxAge: 1000 * 60 * 60 * 24 * 100,
      });
    } else {
      const userToken = generateToken();
      insert("users", {
        token: userToken,
        discord: {
          id: discord.id,
          name: discord.username,
          avatar: `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`,
          accessToken: access.access_token,
          refreshToken: access.refresh_token,
        },
      });
      res.cookie("token", userToken, {
        maxAge: 1000 * 60 * 60 * 24 * 100,
      });
    }
    res.redirect("/");
  });

  app.post("/auth/startAuthentication", async (req, res) => {
    try {
      const verificationToken = await (
        await masterSession
      ).authenticate(req.body.username as string);
      res.json({ success: true }).end();
      verificationTokens.set(req.body.username as string, verificationToken);
      setTimeout(
        () => verificationTokens.delete(req.body.username as string),
        1000 * 60 * 5
      );
    } catch (e) {
      res.status(400).json({ success: false, error: e.message }).end();
    }
  });

  app.post("/auth/verify", async (req, res) => {
    const verificationToken = verificationTokens.get(req.body.username as string);
    if (!verificationToken)
      return res
        .status(400)
        .json({ success: false, error: "no verification token found" })
        .end();
    if (verificationToken.toUpperCase() !== req.body.token.toUpperCase())
      return res
        .status(400)
        .json({ success: false, error: "invalid verification token" })
        .end();
    verificationTokens.delete(req.body.username as string);
    const user = await getUser(req.body.username as string);
    if (!user)
      return res.status(400).json({ success: false, error: "user not found" }).end();

    const dbUserMatch = await getAccount({ tetrioID: user._id });
    let token;
    if (!dbUserMatch) {
      const res = await createAccount(user._id);
      token = res.token;
    } else {
      token = dbUserMatch.token;
      updateAccountTetrio({ tetrioID: user._id });
    }
    authenticatedUsers.push(user._id);

    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 100,
    });

    res.send({ success: true }).end();
  });

  app.get("/auth", async (req, res) => {
    // @ts-ignore
    return res.json(req.user);
  });

  app.get("/rooms", (_, res) => res.redirect("/"));
  app.get("/room", (_, res) => res.redirect("/"));
  app.get("/rooms/:id", async (req, res) => {
    const user = req.user;
    if (!user) return res.redirect("/login");
    const roomId = req.params.id;
    log(req.params.id, rooms);
    if (!rooms.includes(roomId.toUpperCase()))
      return res.status(404).send("room not found").end();
    return res.sendFile(join(__dirname, "./content/room/index.html"));
  });

  // render health check
  app.get("/status", async (_, res) => {
    try {
      res
        .status(200)
        .json({ connected: (await masterSession).connected() })
        .end();
    } catch (e) {
      res.status(200).json({ connected: false }).end();
    }
  });

  app.get("/logs/all", async (_, res) => {
    res.send(await loadLogs("logs", { content: 0 }));
  });

  app.get("/logs/file", async (req, res) => {
    try {
      res.send(await loadLog(req.query.id as string, "logs"));
    } catch (e) {
      res.status(400).send("failed to load log `" + req.query.id.toString() + "`");
    }
  });
  app.get("/glogs/all", async (_, res) => {
    res.json(await loadLogs("glogs", { states: 0 }));
  });

  app.get("/glogs/file", cors(), async (req, res) => {
    res.send(await loadLog(req.query.id as string, "glogs"));
  });

  app.get("/glogs/:file", async (_, res) => {
    res.sendFile(join(__dirname, "content/log-viewer/index.html"));
  });
}
