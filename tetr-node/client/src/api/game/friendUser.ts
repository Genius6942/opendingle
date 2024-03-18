// @ts-nocheck
import post from "./post";
import { log } from "../../../../game/utils/log";

export default async function friendUser(
  token: string,
  id: string,
): Promise<any> {
  const result = await post(token, "relationships/friend", { user: id });

  if (result && result.success) return true;
  else {
    throw new Error(
      result.error.msg || "An unknown error occurred while friending user.",
    );
  }
}
