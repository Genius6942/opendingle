// @ts-nocheck
import post from "./post";

export default async function blockUser(
  token: string,
  id: string,
): Promise<any> {
  const result = await post(token, "relationships/block", { user: id });

  if (result && result.success) return true;
  else {
    throw new Error("failed to block user");
  }
}
