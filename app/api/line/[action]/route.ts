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
      return handlePostWebhook(request);

    case "reply":
      return handlePostReply(request);

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

async function handlePostWebhook(request: NextRequest) {
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

async function handlePostReply(request: NextRequest) {
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

    await lineService.replyUser(userId, text);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error reply LINE message:", error);

    return NextResponse.json(
      {
        message: "Unable to reply LINE message",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      action: string;
    }>;
  },
) {
  const { action } = await context.params;

  switch (action) {
    case "room":
      return handleGetRoom(request);

    case "message":
      return handleGetMessage(request);

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

async function handleGetRoom(request: NextRequest) {
  const room = await lineService.getRoom();

  return NextResponse.json({
    success: true,
    data: room,
  });
}

async function handleGetMessage(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json(
      {
        success: false,
        message: "roomId is required",
      },
      {
        status: 400,
      },
    );
  }

  const messages = await lineService.getMessage(Number(roomId));

  return NextResponse.json({
    success: true,
    data: messages,
  });
}
