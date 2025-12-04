import { Request, Response } from "express";
import User from "../models/User";
import Customer from "../models/Customer";
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
} from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, mobile, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      res
        .status(400)
        .json({ error: "User with this email or mobile already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      mobile,
      firstName,
      lastName,
    });

    // Create Customer profile if role is customer
    if (role === "customer") {
      await Customer.create({
        user: user._id,
        companyName: `${firstName} ${lastName}`,
        shippingAddresses: [],
      });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken: tokens.accessToken,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken: tokens.accessToken,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
    return;
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).json({ error: "No refresh token provided" });
      return;
    }

    const decoded: any = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (error: any) {
    res.status(403).json({ error: "Invalid refresh token" });
    return;
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Server error" });
  }
};
