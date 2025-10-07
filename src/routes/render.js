import express from "express";
import { resetPasswordPayload, resetPasswordView } from "../controllers/renderController.js";
const router = express.Router();


// halaman form reset password
/**
 * @swagger
 * /reset-password:
 *   get:
 *     summary: Halaman form reset password
 *     description: Menampilkan halaman form untuk reset password (biasanya render HTML).
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Halaman reset password ditampilkan.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><form>...</form></body></html>"
 */
router.get("/reset-password", resetPasswordView);

// submit form reset password
/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Submit form reset password
 *     description: Menerima payload untuk reset password (misalnya token, password baru).
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
 *         description: Password berhasil direset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password berhasil direset."
 *       400:
 *         description: Payload tidak valid.
 *       401:
 *         description: Token invalid atau sudah kadaluarsa.
 */
router.post("/reset-password",resetPasswordPayload);

export default router;
