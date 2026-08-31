import { createClient } from "redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  const subscriber = createClient({
    url: process.env.REDIS_URL,
  });

  subscriber.on("error", (error) => {
    console.error("Redis Subscriber Error:", error);
  });

  const stream = new ReadableStream({
    async start(controller) {
      if (!subscriber.isOpen) {
        await subscriber.connect();
      }

      await subscriber.subscribe("chat-message", (message) => {
        console.log(
          "subscriber chat-message",
          JSON.stringify(message).substring(0, 500),
        );

        const data = `data: ${message}\n\n`;

        console.log("SSE BEFORE ENQUEUE", Buffer.byteLength(data, "utf8"));

        controller.enqueue(encoder.encode(`data: ${message}\n\n`));

        console.log("SSE AFTER ENQUEUE");
      });
    },

    async cancel() {
      if (subscriber.isOpen) {
        await subscriber.unsubscribe("chat-message");

        await subscriber.quit();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
