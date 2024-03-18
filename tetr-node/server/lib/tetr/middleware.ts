import { NextFunction, Request, RequestHandler, Response } from "express";
import { query } from "../../../lib/mongodb";
import { User } from "../../types";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.url.includes("auth/verify") ||
    req.url.includes("auth/startAuthentication") ||
    req.url.includes("login") ||
    req.url.includes("status") ||
    req.url.includes("js") ||
    req.url.includes("faq.json") ||
    req.url.includes("faq") ||
    req.url.includes("root") ||
    req.url.includes("stats") ||
    req.url.includes("engine") ||
    req.url.includes("leaderboard") ||
    req.url.includes("upvote") ||
    req.url === "/" ||
    req.url === ""
  ) {
    return next();
  }
  if (req.cookies.token) {
    const users = (await query("users", {
      token: req.cookies.token,
    })) as User[];
    if (users.length === 0) {
      res.clearCookie("token");
      return res.redirect("/login");
    } else {
      const user = users[0];
      user.id = (user as any)._id.toString();
      // @ts-ignore
      delete user._id;
      req.user = user;
      return next();
    }
  }

  return res.redirect("/login");
};
export default authMiddleware;
