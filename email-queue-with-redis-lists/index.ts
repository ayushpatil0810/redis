import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_NAME = "queue:emails";

app.post("/send-email", async (req, res) => {
  const job = {
    to: req.body.to,
    subject: req.body.subject || "No Subject",
    body: req.body.body || "No Body",
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(QUEUE_NAME, JSON.stringify(job));
  res.status(201).json({ message: "Email added to queue" });
});

app.get("/emails/process-one", async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_NAME);
  if (!rawJob) {
    return res.status(200).json({ message: "No emails to process" });
  }
  const job = JSON.parse(rawJob);

  // Simulate email sending (replace with actual email sending logic)
  console.log(`Processing email to: ${job.to}, subject: ${job.subject}`);
  res.status(200).json({ job });
});

app.listen(3000, () => {
  console.log("Email queue server running at Port 3000");
});

/*
Issues with this approach:
1. Job Loss: If the server crashes after popping a job but before processing it, that job is lost.
2. No Retry Mechanism: If processing fails, there is no way to retry the job.
3. Parallel Workers: If multiple workers are processing jobs, they might pop the same job, leading to duplicate processing.
*/
