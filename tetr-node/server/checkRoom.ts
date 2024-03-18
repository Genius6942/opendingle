import { Client } from "../client/src";
import Room from "../client/src/model/room";
import handling from "../game/utils/handling";

export const checkRoom = (room: string, token: string) =>
  new Promise<
    Pick<
      Room,
      | "type"
      | "state"
      | "code"
      | "name"
      | "host"
      | "creator"
      | "options"
      | "players"
    >
  >((resolve, reject) => {
    const session = new Client(token, handling);
    session.events.on("ready", async () => {
      const res = await session.room.join(room);
      if (!res) reject("Room not found");
      await session.room.leave();
      await session.die(true);
      if (res) resolve(res as any);
    });

    session.connect();
  });
