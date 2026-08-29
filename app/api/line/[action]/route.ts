import { NextRequest, NextResponse } from "next/server";
import { validateSignature, webhook } from "@line/bot-sdk";
import { lineService } from "@/app/services/line.service";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      action: string;
    }>;
  },
) {
  const { action } = await context.params;

  switch (action) {
    case "webhook":
      return handleWebhook(request);

    case "send":
      return handleSend(request);

    default:
      return NextResponse.json(
        {
          message: "Not found",
        },
        {
          status: 404,
        },
      );
  }
}

async function handleWebhook(request: NextRequest) {
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

  const events = callbackRequest.events ?? [];

  await lineService.handleEvents(events);

  return NextResponse.json({
    success: true,
  });
}

async function handleSend(request: NextRequest) {
  //
  try {
    const body = await request.json();

    const userId = body.userId;
    const text = body.text;

    if (!userId || !text) {
      return NextResponse.json(
        {
          message: "userId and text are required",
        },
        {
          status: 400,
        },
      );
    }

    await lineService.sendTextMessage(userId, text);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error send LINE message:", error);

    return NextResponse.json(
      {
        message: "Unable to send LINE message",
      },
      {
        status: 500,
      },
    );
  }
}
