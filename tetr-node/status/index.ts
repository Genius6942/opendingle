import { Server } from "socket.io";
import { log } from "../game/utils/log";
import express from "express";
import cookieParser from "cookie-parser";
import { join } from "node:path";
import fetch from "node-fetch";
import { APIUserData, StatusData } from "./types";
import { XPtoLevel, getLevelProgress } from "./helpers";
import config from "../config";

const getLastNElements = <T>(arr: T[], N: number): T[] =>
  arr.length <= N ? arr : arr.slice(arr.length - N);

const launchStatusServer = async () => {
  const history: StatusData[] = [];

  log("Launching status server...");

  const statusTarget = process.env.STATUS_TARGET_MAIN;
  if (!statusTarget) throw new Error("Status target not defined in env");

  const port = process.env.PORT || 3001;
  const app = express();
  const server = app.listen(parseInt(port as any), "0.0.0.0", () =>
    log(`[Status server] Listening on port ${port}: http://localhost:${port}`)
  );

  if (true) {
    app.use((req, _, next) => {
      if (req.url.includes("/status")) return next();
      // log("[Status server] Request from", req.url);
      next();
    });
  }

  if (!process.env.WORKERS) {
    throw new Error("workers not specified");
  }
  if (!process.env.WORKER_URL_FORMULA) {
    throw new Error("worker url formula not specified");
  }

  const getWorkerURL = (worker: string) =>
    process.env.WORKER_URL_FORMULA.replaceAll("<id>", worker);

  const workers = process.env.WORKERS.split(",");

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.static(join(__dirname, "./content")));

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    socket.emit("history", getLastNElements(history, 3600));
  });

  const scrapeData = async (): Promise<StatusData> => {
    const accRes: APIUserData = await fetch(
      `https://ch.tetr.io/api/users/${config.self}`,
      {
        headers: {
          "X-Session-ID": "osk",
        },
      }
    ).then((r) => r.json());

    let mainServerStatus: StatusData["server"]["main"];
    try {
      const serverRes = (await fetch(statusTarget).then((r) => r.json())) as {
        connected: boolean;
      };
      mainServerStatus = { active: true, ...serverRes };
    } catch {
      mainServerStatus = { active: false };
    }

    const workerStatuses = await Promise.all(
      workers.map(async (worker) => {
        try {
          return {
            id: worker,
            active: true,
            rooms: (
              await fetch(getWorkerURL(worker) + "/status").then((r) =>
                r.json()
              )
            ).rooms.length as number,
          };
        } catch {
          return { id: worker, active: false };
        }
      })
    );

    if (accRes.error) {
      console.error("Account info fetch error:", accRes.error);
      throw "Failed to authenticate";
    }

    const userData = accRes.data.user;
    const data: StatusData = {
      id:
        history.length === 0
          ? 0
          : history.reduce((a, b) => Math.max(a, b.id), -Infinity) + 1,
      account:
        userData.role === "banned"
          ? { active: false }
          : {
              active: true,
              level: XPtoLevel(userData.xp),
              levelProgress: getLevelProgress(userData.xp),
              xp: userData.xp,
              gamesPlayed: userData.gamesplayed,
              gamesWon: userData.gameswon,
              playtime: userData.gametime,
            },
      server: {
        main: mainServerStatus,
        // @ts-ignore
        workers: workerStatuses,
      },
    };
    return data;
  };

  const statusLoop = async () => {
    const info = await scrapeData();
    history.push(info);
    io.emit("data", info);
    setTimeout(statusLoop, 1000);
  };
  statusLoop();

  app.get("/status", (_, res) => {
    res.status(200).send("Status server up").end();
  });
};

export default launchStatusServer;
