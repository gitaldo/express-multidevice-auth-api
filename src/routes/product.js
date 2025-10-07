import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getProducts } from "../controllers/productController.js";
import {verifyLimiter} from "../middleware/rateLimiter.js"

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Ambil daftar produk (protected)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar produk berhasil diambil
 */
router.get("/", getProducts);

export default router;
