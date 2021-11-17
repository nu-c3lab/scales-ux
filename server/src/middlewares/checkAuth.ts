import passport from "passport";
import { NextFunction, Request, Response } from "express";

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers["x-api-key"] === process.env.PROXY_API_KEY) {
      return next();
    }
    passport.authenticate("jwt", { session: false }, (error, user, info) => {
      if (error) {
        console.log(error);
        return next(error);
      }
      if (!user) {
        return res.send_unauthorized("Unauthorized");
      } else {
        req.user = user;
        next();
      }
    })(req, res, next);
  } catch (error) {
    console.log(error);
  }
};

export default checkAuth;
