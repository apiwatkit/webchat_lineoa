import { webhook, messagingApi } from "@line/bot-sdk";
import { EventEmitter } from "node:events";
import { LineChatMessageInterface } from "../interface";

class LineService {
  private client?: messagingApi.MessagingApiClient;
  private blobClient?: messagingApi.MessagingApiBlobClient;
  private emitter = new EventEmitter();

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

    console.log("event.message.type", event.message.type);

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

    this.emitter.emit("message", dataEmit);
  }

  onMessage(listener: (message: LineChatMessageInterface) => void) {
    this.emitter.on("message", listener);
  }

  offMessage(listener: (message: LineChatMessageInterface) => void) {
    this.emitter.off("message", listener);
  }

  async sendTextMessage(userId: string, text: string) {
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
  }
}

export const lineService = new LineService();
