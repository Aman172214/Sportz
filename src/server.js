import express from "express";
import matchesRouter from "./routes/matches.js";
import http from "http";
import { webSocketServer } from "./ws/index.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.use("/matches", matchesRouter);

const { broadcastMatchCreated } = webSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`Server is running on ${baseUrl}`);
  console.log(
    `Websocket server is running on ${baseUrl.replace("http", "ws")}/ws`,
  );
});
