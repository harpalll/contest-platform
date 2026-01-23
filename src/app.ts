import express from "express";
import authRouter from "./routes/auth.routes";

const app = express();
app.use(express.json());

app.use("/api/v1/auth", authRouter);

app.get("/api/v1/healthcheck", (_, res) => {
  res.status(200).json({
    message: "server is up and running!",
  });
});

export default app;
