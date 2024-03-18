import { ObjectId, Document } from "mongodb";
import { query, insert } from "./mongodb";

interface Log {
  timestamp: Date;
}

export const loadLogs = async <T = {}>(
  collection = "logs",
  projection: Document = {},
) => {
  return (await query<Log & T>(collection, {}, projection)).map((log) => ({
    ...log,
    _id: log._id.toString(),
  }));
};

export const loadLog = async <T = {}>(id: string, collection = "logs") => {
  const res = await query<Log & T>(collection, { _id: new ObjectId(id) });
  if (res[0]) return { ...res[0], _id: res[0]._id.toString() };
  else throw new Error("log not found");
};

export const uploadLog = async (
  log: Log & { [k: string]: string | number | object | Date | boolean },
  collection = "logs",
) => {
  return await insert(collection, log);
};
