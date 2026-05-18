import express from "express";
import mongoose from "mongoose";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otpKey(phone: string) {
  return `otp:${phone}`;
}

app.post("/otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.setex(otpKey(phone), 30, otp); // OTP expires in 30 seconds
  res.json({ message: "OTP sent successfully", otp }); // In production, you would send the OTP via SMS instead of returning it in the response
});

app.post("/otp/verify", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }
  const storedOtp = await redis.get(otpKey(phone));

  if (storedOtp === otp) {
    await redis.del(otpKey(phone));
    res.json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.get("/otp/:phone/ttl", async (req, res) => {
  const { phone } = req.params;
  const ttl = await redis.ttl(otpKey(phone));
  res.json({ ttl });
});

app.listen(3000, () => {
  console.log("Server running at Port http://localhost:3000");
});
