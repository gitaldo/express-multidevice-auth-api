import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../utils/jwt.js";
import { hashToken } from "../utils/token.js";
import {
  notifForgotPassword,
  notifyOldDevices,
  sendDeviceVerificationEmail,
} from "../utils/mailer.js";

import redis from "../config/redis.js";

const REFRESH_COOKIE = process.env.REFRESH_TOKEN_COOKIE_NAME || "rtid";

function getDeviceFromReq(req) {
  return {
    deviceId: req.headers["x-device-id"]?.toString() || "", // required
    userAgent: req.headers["user-agent"]?.toString() || "unknown",
    ip: (req.headers["x-forwarded-for"] || req.ip || "").toString(),
    os: req.headers["sec-ch-ua-platform"]?.toString() || undefined,
  };
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError(400, "Email already registered");

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { name, email, password: hash } });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    const device = getDeviceFromReq(req);

    if (!device.deviceId) {
      return res.status(400).json({ message: "Missing x-device-id header" });
    }

    if (!user) throw new AppError(401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new AppError(401, "Invalid credentials");

    // cek device
    let userDevice = await prisma.userDevice.findUnique({
      where: {
        userId_deviceId: { userId: user.id, deviceId: device.deviceId },
      },
    });

    if (!userDevice) {
      // create entri device before verified
      userDevice = await prisma.userDevice.create({
        data: {
          userId: user.id,
          deviceId: device.deviceId,
          userAgent: device.userAgent,
          ipAddress: device.ip,
          os: device.os,
          verified: false,
        },
      });
    }

    if (!userDevice.verified) {
      // create device-verify-token (JWT) dan save key to Redis
      const verifyJwt = signAccessToken({
        uid: user.id,
        did: device.deviceId,
      });

      // Save token di Redis, TTL 15 minute
      const key = `devverify:${verifyJwt}`;
      await redis.set(
        key,
        JSON.stringify({
          userId: user.id,
          deviceId: device.deviceId,
        }),
        "EX",
        60 * 15
      );

      // send verification email
      const verifyUrl = `${
        process.env.APP_URL
      }/api/auth/verify-device?token=${encodeURIComponent(verifyJwt)}`;
      await sendDeviceVerificationEmail({
        to: email,
        verifyUrl,
        deviceInfo: {
          ip: device.ip,
          os: device.os,
          userAgent: device.userAgent,
        },
      });

      // respon 202 - pending verification
      return res.status(202).json({
        message: "Device not verified. Verification email sent.",
        next: "Check your email to approve this device.",
      });
    }

    const accessToken = signAccessToken({ id: user.id, did: device.deviceId });
    const refreshToken = signRefreshToken({
      id: user.id,
      did: device.deviceId,
    });

    // save refresh token ke DB
    const decoded = verifyRefreshToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(decoded.exp * 1000),
        ip: device.ip,
        userAgent: device.userAgent,
        os: device.os,
      },
    });

    await redis.set(
      `refresh:${user.id}:${device.deviceId}`,
      refreshToken,
      "EX",
      60 * 60
    ); // expire 1 hour

    // set cookie httpOnly
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:
        parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "7") *
        24 *
        60 *
        60 *
        1000,
      path: "/",
    });

    // update lastLogin
    await prisma.userDevice.update({
      where: {
        userId_deviceId: { userId: user.id, deviceId: device.deviceId },
      },
      data: { lastLogin: new Date() },
    });

    return res.json({ accessToken });
  } catch (e) {
    next(e);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;

    if (!token) throw new AppError(401, "Missing refresh token");

    const deviceInfo = {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      os: req.headers["sec-ch-ua-platform"] || "unknown",
    };

    let payload;
    try {
      payload = verifyRefreshToken(token); // { id, iat, exp }
    } catch (e) {
      throw new AppError(401, "Invalid refresh token");
    }

    const record = await prisma.refreshToken.findUnique({ where: { token } });
    if (!record || record.revokedAt)
      throw new AppError(401, "Refresh token revoked or not found");
    if (record.expiresAt < new Date())
      throw new AppError(401, "Refresh token expired");

    // optional: rotate refresh token (good practice)
    // revoke old
    await prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
    // issue new
    const newRefreshToken = signRefreshToken({
      id: payload.id,
      did: payload.did,
    });

    const decoded = verifyRefreshToken(newRefreshToken);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.id,
        expiresAt: new Date(decoded.exp * 1000),
        ip: deviceInfo.ip,
        userAgent: deviceInfo.userAgent,
        os: deviceInfo.os,
      },
    });

    await redis.set(
      `refresh:${payload.id}:${payload.did}`,
      newRefreshToken,
      "EX",
      60 * 60 * 24 * (parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS) || 7)
    );

    // set cookie baru
    res.cookie(REFRESH_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:
        parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "7") *
        24 *
        60 *
        60 *
        1000,
      path: "/",
    });

    // access token baru
    const accessToken = signAccessToken({ id: payload.id, did: payload.did });

    return res.json({ accessToken });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;

    if (token) {
      const decoded = verifyRefreshToken(token);

      await redis.del(`refresh:${decoded.id}:${decoded.did}`);

      await prisma.refreshToken.updateMany({
        where: { token, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
    return res.json({ message: "Logged out" });
  } catch (e) {
    next(e);
  }
};

export const verifyDevice = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Missing token" });
    }

    let payload;
    try {
      payload = verifyAccessToken(token); // { uid, did, iat, exp, jti? }
    } catch (e) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    // makesure token is pending in Redis
    const key = `devverify:${token}`;
    const data = await redis.get(key);
    if (!data) {
      return res
        .status(400)
        .json({ message: "Verification link already used or expired" });
    }
    const { userId, deviceId } = JSON.parse(data);

    // send verification email
    await notifyOldDevices({
      userId: userId,
      newDeviceId: deviceId,
    });

    // tag verified device in DB
    await prisma.userDevice.update({
      where: { userId_deviceId: { userId, deviceId } },
      data: { verified: true, lastLogin: new Date() },
    });

    // delete pending key
    await redis.del(key);

    const reqDevice = getDeviceFromReq(req);
    if (reqDevice.deviceId && reqDevice.deviceId === deviceId) {
      const accessToken = signAccessToken({ id: userId, did: deviceId });
      const refreshToken = signRefreshToken({ id: userId, did: deviceId });
      const decoded = verifyRefreshToken(refreshToken);
      const hashed = hashToken(refreshToken);

      await prisma.refreshToken.create({
        data: {
          token: hashed,
          userId,
          expiresAt: new Date(decoded.exp * 1000),
          ip: reqDevice.ip,
          userAgent: reqDevice.userAgent,
          os: reqDevice.os || "unknown",
        },
      });

      await redis.set(
        `refresh:${userId}:${deviceId}`,
        refreshToken,
        "EX",
        60 * 60 * 24 * parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "7", 10)
      );

      res.cookie(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge:
          parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "7", 10) *
          24 *
          60 *
          60 *
          1000,
        path: "/",
      });

      return res.json({
        message: "Device verified. You are now logged in.",
        accessToken,
      });
    }

    
    return res.json({
      message: "Device verified. Please login on that device.",
    });
  } catch (err) {
    next(err);
  }
};

export const device = async (req, res) => {
  const userId = req.user.id; 
  const devices = await prisma.userDevice.findMany({
    where: { userId },
    select: {
      id: true,
      deviceId: true,
      verified: true,
      lastLogin: true,
    },
  });
  res.json(devices);
};

export const deleteDevice = async (req, res) => {
  const userId = req.user.id;
  const deviceId = parseInt(req.params.id);
  const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;

  const decoded = verifyRefreshToken(token);

  await prisma.userDevice.updateMany({
    where: { id: deviceId, userId },
    data: { verified: false },
  });

  await redis.del(`refresh:${decoded.id}:${decoded.did}`);

  res.json({ success: true });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;

  // get user
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return res.status(400).json({ message: "Old password wrong" });

  // update password
  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  // revoke all token in Redis

  const decoded = verifyRefreshToken(token);

  await redis.del(`refresh:${decoded.id}:${decoded.did}`);

  res.json({ message: "Password updated, all sessions revoked" });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate token
    const token = signAccessToken({ id: user.id, did: device.deviceId });

    const resetLink = `${process.env.APP_URL_FE}/reset-password?token=${token}`;

    await redis.set(`resetLink:${user.id}`, token, "EX", 60 * 15);

    // Send email
    await notifForgotPassword({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Reset Password",
      html: `<p>Klik this link for reset password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    return res.json({ message: "Link reset password already send to email" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error on Server" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log(token, newPassword);
    // Verifikasi token
    const decoded = verifyAccessToken(token);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const redisRefreshToken = await redis.get(`resetLink:${decoded.id}`);

    if (!redisRefreshToken) {
      return res.status(401).json({ message: "Token already in use" });
    }

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    await redis.del(`resetLink:${decoded.id}`);

    return res.json({ message: "Reset Password Success" });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ message: "Token invalid or expired" });
  }
};
