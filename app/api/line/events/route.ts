import { LineChatMessageInterface } from "@/app/interface";
import { lineService } from "@/app/services/line.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  let listener: ((message: LineChatMessageInterface) => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`: connected\n\n`));

      listener = (message: LineChatMessageInterface) => {
        const data = `data: ${JSON.stringify(message)}\n\n`;

        console.log("SSE SEND", message.type, data.length);

        controller.enqueue(encoder.encode(data));

        controller.enqueue(encoder.encode(`: flush\n\n`));

        console.log("SSE SENT", message.type);
      };

      lineService.onMessage(listener);
    },

    cancel() {
      if (listener) {
        lineService.offMessage(listener);
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
