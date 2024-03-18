// @ts-nocheck
import post from "./post";

export default async function unfriendUser(
  token: string,
  id: string,
): Promise<any> {
  const result = await post(token, "relationships/remove", { user: id });

  if (result && result.success) return true;
  else {
    throw new Error("failed to unfriend user");
  }
}
