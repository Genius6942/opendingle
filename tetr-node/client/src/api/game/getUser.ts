import { get } from ".";
import { User } from "../channel/getUser";

const getUser = async (token: string, id: string) => {
  const res = await get<any>(token, "users/" + encodeURIComponent(id));
  if (res.success) return res.user as User & { friendedYou: boolean };
  return null;
};

export default getUser;
