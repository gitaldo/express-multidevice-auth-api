import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getProducts } from "../controllers/productController.js";
import {verifyLimiter} from "../middleware/rateLimiter.js"

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get product list (protected)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product list retrieved successfully.
 */
router.get("/", verifyLimiter,authMiddleware,getProducts);

export default router;
