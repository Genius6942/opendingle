import fetch from "node-fetch";
import { log } from "../../game/utils/log";

export default async function request<T = any>(
  path: string,
  json: any,
): Promise<T> {
  log(new URLSearchParams(json).toString());
  return (await (
    await fetch(
      "https://discord.com/api/v10/" +
        (path.startsWith("/") ? path.slice(1) : path),
      {
        method: "POST",
        body: new URLSearchParams(json).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )
  ).json()) as T;
}
