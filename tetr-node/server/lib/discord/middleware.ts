import { NextFunction, Request, Response } from "express";
import { query, update } from "../../../lib/mongodb";
import { DiscordUser, User } from "../../types";
import fetch from "node-fetch";

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.url.includes("oauth")) return next();
  if (req.cookies.token) {
    const users = (await query("users", {
      token: req.cookies.token,
    })) as User[];
    if (users.length === 0) {
      res.clearCookie("token");
      // log("redirecting to discord oauth", process.env.MODE === "production" ? process.env.DISCORD_OAUTH_URL! : process.env.DISCORD_DEV_OAUTH_URL!)
      res.redirect(
        process.env.MODE === "production"
          ? process.env.DISCORD_OAUTH_URL!
          : process.env.DISCORD_DEV_OAUTH_URL!,
      );
    } else {
      // const access = await refreshToken(users[0].discord.refreshToken);
      // @ts-ignore
      const access = users[0].discord;
      const discord = (await (
        await fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${access.accessToken}`,
          },
        })
      ).json()) as DiscordUser;
      // log(discord)
      update(
        "users",
        { discord: { id: discord.id } },
        {
          $set: {
            discord: {
              id: discord.id,
              name: discord.username,
              avatar: `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`,
              accessToken: access.accessToken,
              refreshToken: access.refreshToken,
            },
          },
        },
      );
      const user = users[0];
      user.id = (user as any)._id.toString();
      // @ts-ignore
      user.discord = {
        id: discord.id,
        name: discord.username,
        avatar: `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png`,
        accessToken: access.accessToken,
        refreshToken: access.refreshToken,
      };
      // @ts-ignore
      req.user = user;
      next();
    }
  } else {
    return res.redirect(
      process.env.MODE === "production"
        ? process.env.DISCORD_OAUTH_URL!
        : process.env.DISCORD_DEV_OAUTH_URL!,
    );
  }
}
