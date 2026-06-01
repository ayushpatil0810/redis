import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// unrelated to the leaderboard, just for testing purposes
app.post("/post/:id/views", async (req, res) => {
  const { id } = req.params;
  const views = await redis.incr(`post:${id}:views`);
  res.json({ id, views });
});

app.post("/leaderboard/score", async (req, res) => {
  const { userId, score } = req.body;
  if (typeof userId !== "string" || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  await redis.zadd("leaderboard", score, userId);
  res.json({ message: "Score updated", userId, score });
});

app.get("/leaderboard", async (req, res) => {
  const topUsers = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");
  res.json(topUsers);
});

app.get("/leaderboard/:id/rank", async (req, res) => {
  const { id } = req.params;
  const rank = await redis.zrevrank("leaderboard", id);
  if (rank === null) {
    return res.status(404).json({ error: "User not found in leaderboard" });
  }
  res.json({ userId: id, rank: rank + 1 }); // +1 to convert from 0-based index to rank
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
