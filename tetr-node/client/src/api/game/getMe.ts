// @ts-nocheck
import get from "./get";
import fetch from "node-fetch";

export default async function getMe(token: string): Promise<any> {
  const result = await get(token, "users/me");

  if (result && result.success) return result.user;
  else {
    const ip = await fetch("https://api.ipify.org/").then((r) => r.text());
    // console.log(result);
    throw new Error(
      "failed to get user info: " +
        result.error.msg +
        " with ip " +
        ip +
        " and token " +
        token.toString()
    );
  }
}
