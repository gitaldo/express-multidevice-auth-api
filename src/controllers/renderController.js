import prisma from "../config/prisma.js";

import axios from "axios";

// halaman form reset password
export const resetPasswordView = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Token tidak valid atau hilang");
  }

  // render form, kirim token ke FE
  res.render("reset-password", { token });
};

// submit form reset password
export const resetPasswordPayload = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // panggil API BE untuk update password
    await axios.post(`${process.env.APP_URL}/api/auth/reset-password`, {
      token,
      newPassword,
    });

    res.send("Password berhasil diperbarui, silakan login ulang.");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(400).send("Gagal reset password. Token mungkin tidak valid.");
  }
};
