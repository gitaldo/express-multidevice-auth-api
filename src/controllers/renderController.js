// import prisma from "../config/prisma.js";

import axios from "axios";

// form reset password page
export const resetPasswordView = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Invalid Token");
  }

  // render form, send token to FE
  res.render("reset-password", { token });
};

// submit form reset password
export const resetPasswordPayload = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // call API BE for update password
    await axios.post(`${process.env.APP_URL}/api/auth/reset-password`, {
      token,
      newPassword,
    });

    res.send("Password successfully updated, please log in again.");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(400).send("Password reset failed. The token may be invalid.");
  }
};
