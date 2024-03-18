import { NextFunction, Request, RequestHandler, Response } from "express";
import { query } from "../../../lib/mongodb";
import { User } from "../../types";
import { log } from "../../../game/utils/log";

export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    req.url.includes("auth/verify") ||
    req.url.includes("auth/startAuthentication") ||
    req.url.includes("login")
  ) {
    log("authmiddleware skip");
    return next();
  }
  if (req.cookies.token) {
    log("before query");
    const users = (await query("users", {
      token: req.cookies.token,
    })) as User[];
    log(users);
    if (users.length === 0) {
      res.clearCookie("token");
      log("redirect to login");
      return res.redirect("/login");
    } else {
      const user = users[0];
      user.id = (user as any)._id.toString();
      // @ts-ignore
      delete user._id;
      // @ts-ignore
      req.user = user;
      log("logged in as ", user);
      return next();
    }
  }
};
