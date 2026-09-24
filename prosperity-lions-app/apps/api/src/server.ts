import "dotenv/config";
import express from "express";
import cors from "cors";
import { quizRouter } from "./routes/quiz.js";
import { venuesRouter } from "./routes/venues.js";
import { promotionsRouter } from "./routes/promotions.js";
import { fortuneRouter } from "./routes/fortune.js";
import { hongbaoRouter } from "./routes/hongbao.js";
import { pointsRouter } from "./routes/points.js";
import { chatRouter } from "./routes/chat.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/quiz", quizRouter);
app.use("/api/venues", venuesRouter);
app.use("/api/promotions", promotionsRouter);
app.use("/api/fortune", fortuneRouter);
app.use("/api/hongbao", hongbaoRouter);
app.use("/api/points", pointsRouter);
app.use("/api/chat", chatRouter);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Prosperity Lions API listening on http://localhost:${port}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("WARNING: ANTHROPIC_API_KEY not set. /api/chat will fail until it is.");
  }
});
