import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.config.js";
import modulesRouter from "./modules/index.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import compression from "compression";
import path from "path";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
const allowedOrigins = ["http://localhost:3000", "https://radhey-dynamic.vercel.app"];

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  skip: (req) => {
    return req.path.startsWith("/api/v1/website/files");
  },
});
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(passport.initialize());

// app.use(requestLogger);

app.options("*", cors());
app.use(apiLimiter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/v1", modulesRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
