import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import renderRoutes from "./routes/render.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Add Http Security Headers
app.use(helmet());

// set other access domain (Cors)
app.use(
  cors({
    origin: true, // sesuaikan untuk production
    credentials: true,
  })
);

app.use(express.json());
// parser cokies
app.use(cookieParser());

// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src", "views"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", renderRoutes);

// docs
// setupSwagger(app);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true, // 🔑 ini penting
    },
  })
);

// not found + error
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + process.env.PORT);
});
