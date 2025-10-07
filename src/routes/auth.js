import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  verifyDevice,
  device,
  deleteDevice,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import {
  validate,
  registerSchema,
  loginSchema,
} from "../validation/auth.schema.js";
import {loginLimiter} from "../middleware/rateLimiter.js"
import { authMiddleware } from "../middleware/authMiddleware.js";



const router = express.Router();


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Berhasil register
 */
router.post("/register",loginLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login dan dapatkan access token (refresh token via cookie)
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-device-id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique device ID untuk mengidentifikasi device pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Berhasil login
 */
router.post("/login", loginLimiter,validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Minta access token baru dengan refresh token (cookie/body)
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: rtid
 *         schema:
 *           type: string
 *         required: true
 *         description: Refresh token ID (rtid) yang disimpan di cookie
 *     responses:
 *       200:
 *         description: Access token baru berhasil dibuat
 */
router.post("/refresh",refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout (revoke refresh token & clear cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Berhasil logout
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/verify-device:
 *   get:
 *     summary: Verify another device (revoke refresh token & clear cookie)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token sent to the device
 *     responses:
 *       200:
 *         description: Device verified. Please login on that device.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device verified. Please login on that device.
 */
router.get("/verify-device",verifyDevice);

/**
 * @swagger
 * /api/auth/devices:
 *   get:
 *     summary: List Of device by user id
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List verify Device
 */
router.get("/devices",authMiddleware,device);


/**
 * @swagger
 * /api/auth/devices/:id:
 *   delete:
 *     summary: List Of device by user id
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delete verify Device
 */
router.delete("/devices/:id",authMiddleware,deleteDevice);

/**
 * @swagger
 * /auth/change-password:
 *    post:
 *      summary: Change password for logged-in user
 *      tags:
 *        - Auth
 *      security:
 *        - bearerAuth: []   # karena pakai authMiddleware
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                oldPassword:
 *                  type: string
 *                  example: OldPass123
 *                newPassword:
 *                  type: string
 *                  example: NewPass123!
 *              required:
 *                - oldPassword
 *                - newPassword
 */
router.post('/change-password',authMiddleware,changePassword);

/**
 * @swagger
 * /auth/forgot-password:
 *    post:
 *      summary: Request a password reset link
 *      tags:
 *        - Auth
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  example: user@example.com
 *              required:
 *                - email
 */
router.post("/forgot-password",forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *    post:
 *      summary: Reset password using token
 *      tags:
 *        - Auth
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *                newPassword:
 *                  type: string
 *                  example: NewPass123!
 *              required:
 *                - token
 *                - newPassword
 */
router.post("/reset-password",resetPassword);


export default router;
