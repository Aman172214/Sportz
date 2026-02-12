import express from "express";
import matchesRouter from "./routes/matches.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/matches", matchesRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
