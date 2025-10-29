import prisma from "../config/prisma.js";

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    return res.success("Product list retrieved successfully", products);
  } catch (err) {
    console.error("❌ [getProducts] Error:", err);

    return res.error(
      "Internal server error",
      500,
      process.env.NODE_ENV === "development" ? err.message : undefined
    );
  }
};
