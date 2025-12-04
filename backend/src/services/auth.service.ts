import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTokens = (user: IUser) => {
  const payload = {
    userId: user._id,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRE || "15m") as any,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRE || "7d") as any,
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};
