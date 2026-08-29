import { LineChatMessageInterface } from "@/app/interface";
import { lineService } from "@/app/services/line.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  let listener: ((message: LineChatMessageInterface) => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      listener = (message: LineChatMessageInterface) => {
        const data = `data: ${JSON.stringify(message)}\n\n`;

        controller.enqueue(encoder.encode(data));
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
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
