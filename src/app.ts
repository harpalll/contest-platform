import express from "express";

// * ROUTES
import { authRouter, contestRouter } from "./routes/index";

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/contests", contestRouter);

app.get("/api/healthcheck", (_, res) => {
  res.status(200).json({
    message: "server is up and running!",
  });
});

export default app;
