import jwt from "jsonwebtoken";

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function signRefreshToken(payload) {
  // refresh token kita buat random + signed untuk verifikasi basic
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${process.env.JWT_REFRESH_EXPIRES_DAYS || 7}d`,
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// token verifikasi device (umur pendek)
export function signDeviceVerifyToken(payload) {
  return jwt.sign(payload, process.env.JWT_DEVICE_VERIFY_SECRET, {
    expiresIn: "15m",
    // jwtid: crypto.randomUUID?.() || undefined, // jti optional
  });
}

export function verifyDeviceVerifyToken(token) {
  return jwt.verify(token, process.env.JWT_DEVICE_VERIFY_SECRET);
}

