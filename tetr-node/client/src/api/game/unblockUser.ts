// @ts-nocheck
import post from "./post";

export default async function unblockUser(
  token: string,
  id: string,
): Promise<boolean> {
  const result = await post(token, "relationships/remove", { user: id });

  if (result && result.success) return true;
  else {
    throw new Error("failed to unblock user");
  }
}
