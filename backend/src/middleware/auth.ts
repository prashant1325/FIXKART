import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/express";

export interface AuthRequest extends Request {
  user?: any;
  auth?: any;
}

// Clerk authentication middleware
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];

  try {
    // Verify Clerk token
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.user = decoded;
    req.auth = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
};

export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify Clerk token
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.user = decoded;
    req.auth = decoded;
    next();
  } catch (error) {
    // If token is invalid, just proceed as guest
    console.warn("Optional token verification failed:", error);
    next();
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("AAGYA AUTH ME", req.user.role);
    if (
      !req.user.role ||
      !req.user.metadata?.role ||
      !roles.includes(req.user.metadata.role)
    ) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    next();
  };
};
