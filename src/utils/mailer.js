import nodemailer from "nodemailer";
import prisma from "../config/prisma.js";

export function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    secure: false, // true jika port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendDeviceVerificationEmail({ to, verifyUrl, deviceInfo }) {
  const transporter = createTransport();
  const subject = "Verifikasi Perangkat Baru";
  const html = `
    <p>Hai, ada upaya login dari perangkat baru:</p>
    <ul>
      <li>IP: ${deviceInfo.ip}</li>
      <li>OS: ${deviceInfo.os || "-"}</li>
      <li>User-Agent: ${deviceInfo.userAgent}</li>
    </ul>
    <p>Jika ini kamu, klik tombol di bawah untuk mengizinkan perangkat:</p>
    <p><a href="${verifyUrl}" style="padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px">Verifikasi Perangkat</a></p>
    <p>Link ini berlaku 15 menit.</p>
  `;
  await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
}

export async function notifyOldDevices({userId, newDeviceId}) {

  const oldDevices = await prisma.userDevice.findMany({
    where: {
      userId,
      deviceId: { not: newDeviceId },
      verified: true,
    },
  });

  const user = await prisma.user.findUnique({ where: { id:userId } });

  const transporter = createTransport();

  for (const device of oldDevices) {
    // misalnya device.email stored, atau device tied ke user.email
    await transporter.sendMail({
      to: user.email,
      subject: "Device Baru Terverifikasi",
      text: `Device baru berhasil login: ${newDeviceId}. Jika bukan Anda, segera revoke.`,
    });
  }
}

export async function notifForgotPassword(bodyMail) {
  
    const transporter = createTransport();
    await transporter.sendMail(bodyMail);
}
