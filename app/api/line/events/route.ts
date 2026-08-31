import { LineChatMessageInterface } from "@/app/interface";
import { lineService } from "@/app/services/line.service";
import { INSTANCE_ID } from "@/app/lib/instance-id";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  console.log("SSE INSTANCE:", INSTANCE_ID);
  const encoder = new TextEncoder();

  let listener: ((message: LineChatMessageInterface) => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`: connected\n\n`));

      listener = (message: LineChatMessageInterface) => {
        const data = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.enqueue(encoder.encode(`: flush\n\n`));
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
