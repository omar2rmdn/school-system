import jwt from "jsonwebtoken";
import type { UserData } from "../types";

const generateToken = (userData: UserData) => {
  const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY;
  const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY;

  if (!JWT_REFRESH_KEY) throw Error("JWT Refresh Key is not Available");

  if (!JWT_ACCESS_KEY) throw Error("JWT Access Key is not Available");

  const refreshToken = jwt.sign(userData, JWT_REFRESH_KEY, {
    expiresIn: "60d",
  });

  const accessToken = jwt.sign(userData, JWT_ACCESS_KEY, {
    expiresIn: "30m",
  });

  return { refreshToken, accessToken };
};

export { generateToken };
