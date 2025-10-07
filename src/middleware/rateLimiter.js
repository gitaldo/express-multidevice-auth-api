import rateLimit ,  { ipKeyGenerator } from "express-rate-limit";

// Limit login attempts: max 5 per 10 menit per IP
export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  keyGenerator: (req, res) => {
    const ipKey = ipKeyGenerator(req, res); // aman untuk IPv4 & IPv6
    const deviceId = req.body.deviceId ||req.headers["x-device-id"];
    return deviceId ? `${ipKey}:${deviceId}` : ipKey;
  },
  message: "Too many login attempts, please try again later.",
});

// Limit verify attempts: max 10 per 30 menit
export const verifyLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: "Too many verification attempts, please try again later.",
});
