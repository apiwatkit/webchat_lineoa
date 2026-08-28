import { NextRequest, NextResponse } from "next/server";
import { validateSignature, webhook } from "@line/bot-sdk";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const signature = request.headers.get("x-line-signature");

  if (!signature) {
    return NextResponse.json(
      {
        message: "Missing x-line-signature",
      },
      {
        status: 401,
      },
    );
  }

  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) {
    return NextResponse.json(
      {
        message: "LINE_CHANNEL_SECRET is not configured",
      },
      {
        status: 500,
      },
    );
  }

  const isValidSignature = validateSignature(body, channelSecret, signature);

  if (!isValidSignature) {
    return NextResponse.json(
      {
        message: "Invalid signature",
      },
      {
        status: 401,
      },
    );
  }

  const callbackRequest = JSON.parse(body) as webhook.CallbackRequest;
  const events: webhook.Event[] = callbackRequest.events!;

  for (const event of events as webhook.Event[]) {
    console.log("event", event);
  }

  return NextResponse.json({
    success: true,
  });
}
