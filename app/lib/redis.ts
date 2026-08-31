import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not configured");
}

export const redisPublisher = createClient({
  url: redisUrl,
});

redisPublisher.on("error", (error) => {
  console.error("Redis error:", error);
});

if (!redisPublisher.isOpen) {
  await redisPublisher.connect();
}
