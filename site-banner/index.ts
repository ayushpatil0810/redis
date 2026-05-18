import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const BANNER_KEY = "app:banner";

app.post("/banner", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "Message query parameter is required and must be a string.",
    });
  }
  await redis.set(BANNER_KEY, message);
  res.json({ success: true, message: "Banner message set successfully." });
});

app.get("/banner", async (req, res) => {
  const message = await redis.get(BANNER_KEY);
  if (!message) {
    return res.status(404).json({ error: "No banner message found." });
  }
  res.json({ banner: message });
});

app.delete("/banner", async (req, res) => {
  await redis.del(BANNER_KEY);
  res.json({ success: true, message: "Banner message deleted successfully." });
});

app.get("/banner/exists", async (req, res) => {
  const exists = await redis.exists(BANNER_KEY);
  res.json({ exists: Boolean(exists) });
});

app.listen(3000, () => {
  console.log("Server running at Port 3000");
});
