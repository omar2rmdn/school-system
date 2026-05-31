import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../modules/users/model";
import type { UserData } from "../types";

interface JwtPayload {
  _id: string;
  role: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserData;
    }
  }
}

async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }

    try {
      const secret = process.env.JWT_ACCESS_KEY ?? "";
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Get user from token
      const user = await User.findById(decoded._id).select("-password");

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      req.user = {
        _id: user._id as mongoose.Types.ObjectId,
        role: user.role,
        email: user.email,
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
      return;
    }
  } catch (error) {
    next(error);
  }
}

function role(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
      return;
    }

    next();
  };
}

export { auth, role };
