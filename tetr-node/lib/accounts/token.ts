import { User } from "../../server/types";
import { query } from "../mongodb";

const tokens: string[] = [];

const length = 32;
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";

(async () => {
  const res = await query("users", {});
  res.forEach((user: User) => {
    tokens.push(user.token);
  });
})();

export const generateToken = (): string => {
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }

  if (tokens.includes(token)) {
    return generateToken();
  }

  tokens.push(token);
  return token;
};

export const revokeToken = (token: string): boolean => {
  if (!tokens.includes(token)) return false;
  tokens.splice(tokens.indexOf(token), 1);
  return true;
};
