import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import db from "./models/index.js";
import errorHandler from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import initSocket from "./socket/index.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
});

app.use(cors());
app.use(bodyParser.json());

initSocket(io);

app.use("/api", routes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
db.sequelize
  .sync({ alter: process.env.NODE_ENV === "development" })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });

export { app, server, io };
