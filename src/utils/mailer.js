import nodemailer from "nodemailer";
import prisma from "../config/prisma.js";

export function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    secure: false, // true if port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendDeviceVerificationEmail({
  to,
  verifyUrl,
  deviceInfo,
}) {
  const transporter = createTransport();
  const subject = "Verify New Device";
  const html = `
    <p>Hi, We detected a login attempt from a new device:</p>
    <ul>
      <li>IP: ${deviceInfo.ip}</li>
      <li>OS: ${deviceInfo.os || "-"}</li>
      <li>User-Agent: ${deviceInfo.userAgent}</li>
    </ul>
    <p>If this was you, please click the button below to verify your device:</p>
    <p><a href="${verifyUrl}" style="padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px">Verify Device</a></p>
    <p>This verification link is valid for 15 minutes.</p>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}

export async function notifyOldDevices({ userId, newDeviceId }) {
  if (!userId || !newDeviceId) {
    throw new Error("Missing required parameters: userId or newDeviceId");
  }

  // Select user & old devices with paralel methotde to impprove performance
  const [user, oldDevices] = await Promise.all([
    prisma.user.findUnique({ select: { email: true }, where: { id: userId } }),
    prisma.userDevice.findMany({
      where: {
        userId,
        deviceId: { not: newDeviceId },
        verified: true,
      },
      select: { id: true },
    }),
  ]);

  if (!user?.email) {
    console.warn(`User ${userId} not have an email, notification will be skip.`);
    return;
  }

  if (oldDevices.length === 0) {
    console.info(`ℹThere not old device for user ${userId}.`);
    return;
  }

  const transporter = createTransport();

  const mailOptions = {
    to: user.email,
    subject: "Verification New Device",
    text: `New Device Success to login: ${newDeviceId}. If it's not you, immediately revoke access from your account.`,
  };

  try {
    // Paralel Send notification
    await Promise.all(oldDevices.map(() => transporter.sendMail(mailOptions)));
    console.log(
      `Notification will be send to ${oldDevices.length} old device to user ${userId}`
    );
  } catch (err) {
    console.error(
      `Failed to send notification for user${userId}:`,
      err.message
    );
  }
}

export async function notifForgotPassword(bodyMail) {
  const transporter = createTransport();
  await transporter.sendMail(bodyMail);
}
