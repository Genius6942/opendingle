import express from "express";
import cookieParser from "cookie-parser";
import { log } from "../game/utils/log";
import { getRooms as getBotRooms } from "../lib/roomLogger";
import { isValidRoomID } from "../lib/roomID";
import processError from "../lib/processError";

export type SpawnMessage =
  | { joinRoom: string }
  | { createRoom: true | string; type?: "private" | "public" };

const startWorker = (
  token: string,
  startGame: typeof import("../game/index").default,
) => {
  const workerID = process.env.WORKER_ID;
  const workerKey = process.env.WORKER_KEY;
  if (!workerID || !workerKey)
    throw new Error("worker key or id not specified");
  log("starting worker", workerID + "...");

  const port = process.env.PORT || 3002;
  const app = express();
  app.listen(parseInt(port as any), "0.0.0.0", () =>
    log(
      `[Worker ${workerID}] Listening on port ${port}: http://localhost:${port}`,
    ),
  );

  if (process.env.MODE !== "production") {
    app.use((_, __, next) => {
      // log(`[Worker ${workerID}] Request from`, req.url);
      next();
    });
  }

  app.use(cookieParser());
  app.use(express.json());

  app.use((req, res, next) => {
    if (req.url.includes("status")) return next();
    else if (
      !req.headers.authorization ||
      req.headers.authorization !== "Bearer " + workerKey
    ) {
      return res.status(403).send("Unauthorized").end();
    } else {
      return next();
    }
  });

  app.get("/status", (_, res) => {
    res.status(200).json({ rooms: getBotRooms() });
  });

  app.post("/spawn", async (req, res) => {
    const data: SpawnMessage = req.body;
    if (!("joinRoom" in data) && !("createRoom" in data))
      return res.json({
        success: false,
        message: "No room to join or create provided",
      });
    const isPublic = req.body.public ? true : false;
    if ("joinRoom" in data) {
      const roomID = data.joinRoom;
      if (!roomID || typeof roomID !== "string" || !isValidRoomID(roomID))
        return res.json({
          success: false,
          message:
            "Specified room to join is invalid, must be 1-16 alphanumeric characters",
        });
      try {
        const game = await startGame(token, { joinRoom: data.joinRoom });
        res.json({
          success: true,
          code: game.room().code,
        });
      } catch (e) {
        res.json({ success: false, message: processError(e) });
      }
    } else {
      if (data.createRoom === true || data.createRoom === "") {
        // spawn random id room
        try {
          const game = await startGame(token, {
            createRoom: true,
            type: isPublic ? "public" : "private",
          });
          return res.json({
            success: true,
            code: game.room().code,
          });
        } catch (e) {
          return res.json({
            success: false,
            message: processError(e),
          });
        }
      } else {
        if (!isValidRoomID(data.createRoom)) {
          return res.json({
            success: false,
            message:
              "Specified room to create is invalid, must be 1-16 alphanumeric characters",
          });
        } else {
          try {
            const game = await startGame(token, {
              createRoom: data.createRoom,
              type: isPublic ? "public" : "private",
            });
            return res.json({
              success: true,
              code: game.room().code,
            });
          } catch (e) {
            return res.json({
              success: false,
              message: processError(e),
            });
          }
        }
      }
    }
  });
};

export default startWorker;
