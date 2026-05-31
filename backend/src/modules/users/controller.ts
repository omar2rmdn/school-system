import type { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "./model";
import {
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
} from "./validation";
import { generateToken } from "../../utils/token";

async function createUser(req: Request, res: Response) {
  const { error, value } = userRegistrationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const { phone, email } = value;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return res.status(400).json({
      message: "User already exists with this email or phone",
    });
  }

  const user = await User.create({
    ...value,
  });

  return res.status(201).json({
    message: "User created successfully",
    data: user,
  });
}

async function getUsers(req: Request, res: Response) {
  const users = await User.find().select("-password");

  return res.status(200).json({
    count: users.length,
    data: users,
  });
}

async function getUser(req: Request, res: Response) {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("classes", "title")
    .populate("subjects", "title");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    data: user,
  });
}

async function updateUser(req: Request, res: Response) {
  const { error, value } = userUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  if (value.password) {
    const tempUser = await User.findById(req.params.id);
    if (!tempUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    tempUser.password = value.password;
    await tempUser.save();
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("classes", "title")
      .populate("subjects", "title");
    return res.status(200).json({
      message: "User updated successfully",
      data: user,
    });
  }

  const user = await User.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .populate("classes", "title")
    .populate("subjects", "title");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "User updated successfully",
    data: user,
  });
}

async function deleteUser(req: Request, res: Response) {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "User deleted successfully",
  });
}

async function loginUser(req: Request, res: Response) {
  const { error, value } = userLoginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const { email, password } = value;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const { refreshToken, accessToken } = generateToken({
    _id: user._id as mongoose.Types.ObjectId,
    role: user.role,
    email: user.email,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...userResponse } = user.toObject();

  return res.status(200).json({
    message: "Login successful",
    data: {
      user: userResponse,
      accessToken,
    },
  });
}

async function getMe(req: Request, res: Response) {
  const user = await User.findById(req.user?._id).select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    data: user,
  });
}

async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "No refresh token provided",
    });
  }

  try {
    const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY;
    if (!JWT_REFRESH_KEY) throw Error("JWT Refresh Key is not Available");

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_KEY) as any;

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const tokens = generateToken({
      _id: user._id as mongoose.Types.ObjectId,
      role: user.role,
      email: user.email,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      sameSite: "none",
      maxAge: 60 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
    });

    const { password: _, ...userResponse } = user.toObject();

    return res.status(200).json({
      message: "Token refreshed successfully",
      data: {
        user: userResponse,
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
}

async function logoutUser(_req: Request, res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
}

export {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  getMe,
  refresh,
};
