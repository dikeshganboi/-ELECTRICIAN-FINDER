import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { createIndexes } from "./config/createIndexes";
import { logger } from "./config/logger";
import apiRoutes from "./interfaces/http/index";
import { apiLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";
import { setupSocket } from "./interfaces/ws/socket";
import { bindSocket } from "./interfaces/ws/emitter";

const app = express();
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));
app.use(apiLimiter);
app.use("/api", apiRoutes);
app.use(errorHandler);

const server = http.createServer(app);
const io = setupSocket(server);
bindSocket(io);

server.listen(env.port, async () => {
  await connectDb();
  await createIndexes();
  logger.info(`API listening on ${env.port}`);
});
