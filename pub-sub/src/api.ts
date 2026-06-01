import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/notifications", async (req, res) => {
  const payload = {
    title: req.body.title || "Default Title",
    message: req.body.message || "Default Message",
    createdAt: new Date().toISOString(),
  };
  const receivers = await publisher.publish(
    "notifications",
    JSON.stringify(payload),
  );

  res.json({
    status: "Notification sent",
    receivers,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
