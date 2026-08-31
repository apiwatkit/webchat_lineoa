import { webhook, messagingApi } from "@line/bot-sdk";
import { LineChatMessageInterface } from "../interface";
import { ChatMessageRepository, ChatRoomRepository } from "../repository";
import { redisPublisher } from "@/app/lib/redis";

class LineService {
  private client?: messagingApi.MessagingApiClient;
  private blobClient?: messagingApi.MessagingApiBlobClient;

  constructor(
    private readonly chatRoomRepository: ChatRoomRepository,
    private readonly chatMessageRepository: ChatMessageRepository,
  ) {}

  private getClient(): messagingApi.MessagingApiClient {
    if (!this.client) {
      const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!channelAccessToken) {
        throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
      }

      this.client = new messagingApi.MessagingApiClient({
        channelAccessToken,
      });
    }

    return this.client;
  }

  private getBlobClient(): messagingApi.MessagingApiBlobClient {
    if (!this.blobClient) {
      const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!channelAccessToken) {
        throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
      }

      this.blobClient = new messagingApi.MessagingApiBlobClient({
        channelAccessToken,
      });
    }

    return this.blobClient;
  }

  async getLineUserProfile(userId: string) {
    try {
      const client = this.getClient();

      return await client.getProfile(userId);
    } catch (error) {
      console.error("Error getLineUserProfile:", error);

      return null;
    }
  }

  private async getLineContent(messageId: string): Promise<string | null> {
    try {
      const client = this.getBlobClient();

      const { body, httpResponse } =
        await client.getMessageContentWithHttpInfo(messageId);

      const chunks: Buffer[] = [];

      for await (const chunk of body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      const buffer = Buffer.concat(chunks);

      const contentType =
        httpResponse.headers.get("content-type") ?? "application/octet-stream";

      return `data:${contentType};base64,${buffer.toString("base64")}`;
    } catch (error) {
      console.error("Error getLineContent:", error);

      return null;
    }
  }

  async handleEvents(events: webhook.Event[]) {
    for (const event of events) {
      await this.handleEvent(event);
    }
  }

  private async handleEvent(event: webhook.Event) {
    const userId = event.source?.userId;

    if (!userId) {
      return;
    }

    if (event.type !== "message" || event.source?.type !== "user") {
      return;
    }

    const profile = await this.getLineUserProfile(userId);
    const room = await this.createRoom(
      userId,
      profile?.displayName,
      profile?.pictureUrl,
    );

    const baseData: Pick<
      LineChatMessageInterface,
      "userId" | "displayName" | "pictureUrl" | "timestamp" | "sender"
    > = {
      userId,
      displayName: profile?.displayName,
      pictureUrl: profile?.pictureUrl,
      timestamp: event.timestamp,
      sender: "user",
    };

    let dataEmit: LineChatMessageInterface | null = null;

    if (event.message.type === "text") {
      dataEmit = {
        ...baseData,
        type: "text",
        text: event.message.text,
      };
    } else if (event.message.type === "image") {
      const imageUrl = await this.getLineContent(event.message.id);

      if (!imageUrl) {
        return;
      }

      dataEmit = {
        ...baseData,
        type: "image",
        imageUrl,
      };
    } else if (event.message.type === "video") {
      const videoUrl = await this.getLineContent(event.message.id);

      if (!videoUrl) {
        return;
      }

      dataEmit = {
        ...baseData,
        type: "video",
        videoUrl,
      };
    } else if (event.message.type === "file") {
      const fileUrl = await this.getLineContent(event.message.id);

      if (!fileUrl) {
        return;
      }

      dataEmit = {
        ...baseData,
        type: "file",
        fileUrl,
        fileName: event.message.fileName,
      };
    } else if (event.message.type === "sticker") {
      dataEmit = {
        ...baseData,
        type: "sticker",
        stickerPackageId: event.message.packageId,
        stickerId: event.message.stickerId,
      };
    }

    if (!dataEmit) {
      return;
    }

    await this.saveMessage(room.userId, dataEmit, event.message.id);

    const subscriberCount = await redisPublisher.publish(
      "chat-message",
      JSON.stringify(dataEmit),
    );

    console.log(
      "subscriberCount chat-message",
      JSON.stringify(dataEmit).substring(0, 500),
    );
  }

  async replyUser(userId: string, text: string) {
    const client = this.getClient();

    await client.pushMessage({
      to: userId,
      messages: [
        {
          type: "text",
          text,
        },
      ],
    });

    const room = await this.chatRoomRepository.findByUserId(userId);

    if (!room) {
      return;
    }

    const message: LineChatMessageInterface = {
      userId,
      type: "text",
      text,
      timestamp: Date.now(),
      sender: "admin",
    };

    await this.saveMessage(room.userId, message);

    await redisPublisher.publish("chat-message", JSON.stringify(message));
  }

  private async createRoom(
    userId: string,
    displayName?: string,
    pictureUrl?: string,
  ) {
    let room = await this.chatRoomRepository.findByUserId(userId);

    if (!room) {
      room = await this.chatRoomRepository.create(
        userId,
        displayName,
        pictureUrl,
      );
    }

    return room;
  }

  private async saveMessage(
    userId: string,
    data: LineChatMessageInterface,
    lineMessageId?: string,
  ) {
    await this.chatMessageRepository.create({
      userId,
      messageType: data.type,
      textContent: data.text,
      mediaUrl: data.imageUrl ?? data.videoUrl ?? data.fileUrl,
      fileName: data.fileName,
      stickerPackageId: data.stickerPackageId,
      stickerId: data.stickerId,
      sender: data.sender ?? "user",
      lineMessageId,
      messageTimestamp: data.timestamp,
    });
  }

  async getRoom() {
    const result = [];

    const allRoom = await this.chatRoomRepository.findAll();

    for (const room of allRoom) {
      const data = room.toJSON();

      result.push({
        ...data,
        latestMessage: room.messages?.[0] ?? null,
      });
    }

    return result;
  }

  async getMessage(userId: string) {
    const message = await this.chatMessageRepository.findByUserId(userId);

    return message;
  }
}

export const lineService = new LineService(
  new ChatRoomRepository(),
  new ChatMessageRepository(),
);
