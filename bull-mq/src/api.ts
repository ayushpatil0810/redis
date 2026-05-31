import express from "express";
import { emailQueue } from "./queue";
import "./worker";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/add-job", async (req, res) => {
  const job = await emailQueue.add(
    "send-email",
    {
      to: req.body.to,
      subject: req.body.subject || "No Subject",
      message: req.body.message || "No Message",
    },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    },
  );
  res.json({ message: `Job ${job.id} added to the queue`, jobId: job.id });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
