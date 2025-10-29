import express from "express";
import { resetPasswordPayload, resetPasswordView } from "../controllers/renderController.js";
const router = express.Router();


// reset password form page
/**
 * @swagger
 * /reset-password:
 *   get:
 *     summary: Reset password form page
 *     description: Displays the HTML form page for resetting a user's password.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Reset password form displayed successfully.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><form>...</form></body></html>"
 */
router.get("/reset-password", resetPasswordView);

// submit reset password form
/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Submit reset password form
 *     description: Accepts the payload for resetting a password (e.g., token and new password).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1..."
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "MyNewSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password has been successfully reset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password has been successfully reset."
 *       400:
 *         description: Invalid request payload.
 *       401:
 *         description: Invalid or expired token.
 */
router.post("/reset-password",resetPasswordPayload);

export default router;
