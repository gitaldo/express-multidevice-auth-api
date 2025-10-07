import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";
import redis from "../config/redis.js";

export async function authMiddleware(req, res, next) {
  const hdr = req.headers["authorization"];
  if (!hdr) return next(new AppError(401, "Missing Authorization header"));

  const [type, token] = hdr.split(" ");
  if (type !== "Bearer" || !token)
    return next(new AppError(401, "Invalid Authorization header"));

  try {
    const decoded = verifyAccessToken(token);

    const redisRefreshToken = await redis.get(
      `refresh:${decoded.id}:${decoded.did}`
    );

    if (!redisRefreshToken) {
      return res.status(401).json({ message: "User logged out" });
    }
    req.user = decoded;
    next();
  } catch (e) {
    return next(new AppError(401, "Invalid or expired token"));
  }
}
