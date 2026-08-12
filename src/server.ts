import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/prisma.config.js";
import logger from "./utils/logger.utils.js";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    logger.info("✅ Database connected");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  }catch (error) {
  logger.error("❌ Database connection failed");
  console.error(error);
  process.exit(1);
}
}
startServer();
