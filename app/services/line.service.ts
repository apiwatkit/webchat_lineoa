import { webhook, messagingApi } from "@line/bot-sdk";
import { EventEmitter } from "node:events";
import { LineChatMessageInterface } from "../interface";

class LineService {
  private client?: messagingApi.MessagingApiClient;
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

  async getLineUserProfile(userId: string) {
    try {
      const client = this.getClient();

      return await client.getProfile(userId);
    } catch (error) {
      console.error("Error getLineUserProfile:", error);

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

    if (
      event.type !== "message" ||
      event.message.type !== "text" ||
      event.source?.type !== "user"
    ) {
      return;
    }

    const text = event.message.text;
    const profile = await this.getLineUserProfile(userId);

    const data: LineChatMessageInterface = {
      userId,
      text,
      displayName: profile?.displayName,
      pictureUrl: profile?.pictureUrl,
      timestamp: event.timestamp,
      sender: "user",
    };

    this.emitter.emit("message", data);
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
