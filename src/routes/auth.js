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
import {loginLimiter , verifyLimiter} from "../middleware/rateLimiter.js"
import { authMiddleware } from "../middleware/authMiddleware.js";



const router = express.Router();


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and returns user information upon successful registration.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       400:
 *         description: Invalid input data or email already in use.
 */
router.post("/register",loginLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and obtain access token (refresh token via cookie)
 *     description: Authenticates the user and issues an access token along with a refresh token stored in cookies.
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-device-id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique device ID used to identify the user's device.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *       400:
 *         description: Invalid credentials or missing parameters.
 *       401:
 *         description: Unauthorized — incorrect email or password.
 */
router.post("/login", loginLimiter,validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Request a new access token using a refresh token (from cookie or body)
 *     description: Generates a new access token using a valid refresh token provided via cookie or request body.
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: rtid
 *         schema:
 *           type: string
 *         required: true
 *         description: Refresh Token ID (rtid) stored in the user's cookie.
 *     responses:
 *       200:
 *         description: New access token successfully generated.
 *       401:
 *         description: Invalid or expired refresh token.
 */
router.post("/refresh",loginLimiter,refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout (revoke refresh token & clear cookie)
 *     description: Logs out the currently authenticated user by revoking the refresh token and clearing the authentication cookies.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *       401:
 *         description: Unauthorized or missing authentication token.
 */
router.post("/logout",loginLimiter, logout);

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
router.get("/verify-device",verifyLimiter,verifyDevice);

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
router.get("/devices",verifyLimiter,authMiddleware,device);


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
router.delete("/devices/:id",verifyLimiter,authMiddleware,deleteDevice);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for the logged-in user
 *     description: Allows an authenticated user to change their current password by providing the old and new passwords.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []   # Requires authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: The user's current password.
 *                 example: "OldPass123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The new password to be set for the account.
 *                 example: "NewPass123!"
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password has been successfully changed."
 *       400:
 *         description: Invalid request payload.
 *       401:
 *         description: Unauthorized or invalid old password.
 *       500:
 *         description: Internal server error.
 */
router.post('/change-password',verifyLimiter,authMiddleware,changePassword);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     description: Sends a password reset link to the user's registered email address.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's registered email address.
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset link has been sent to the provided email address.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset link has been sent to your email."
 *       400:
 *         description: Invalid or missing email address.
 *       404:
 *         description: Email address not found in the system.
 */
router.post("/forgot-password",verifyLimiter,forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     description: Resets the user's password using a valid reset token.
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
 *                 description: The password reset token sent via email.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The new password to set for the user account.
 *                 example: "NewPass123!"
 *     responses:
 *       200:
 *         description: Password successfully reset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password has been successfully reset."
 *       400:
 *         description: Invalid or missing parameters.
 *       401:
 *         description: Invalid or expired reset token.
 */
router.post("/reset-password",verifyLimiter,resetPassword);


export default router;
