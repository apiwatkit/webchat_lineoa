import { CreateLineChatMessageInterface } from "../interface";
import { ChatMessageModel } from "../models";

export class ChatMessageRepository {
  async create(data: CreateLineChatMessageInterface) {
    return ChatMessageModel.create({
      userId: data.userId,
      messageType: data.messageType,

      textContent: data.textContent ?? null,
      mediaUrl: data.mediaUrl ?? null,
      fileName: data.fileName ?? null,

      stickerPackageId: data.stickerPackageId ?? null,
      stickerId: data.stickerId ?? null,

      sender: data.sender,

      lineMessageId: data.lineMessageId ?? null,

      messageTimestamp: data.messageTimestamp,
    });
  }

  async findByUserId(userId: string) {
    return ChatMessageModel.findAll({
      where: {
        userId,
      },
      order: [["messageTimestamp", "ASC"]],
      raw: true,
    });
  }

  async findLatestByUserId(userId: string) {
    return ChatMessageModel.findOne({
      where: {
        userId,
      },
      order: [["messageTimestamp", "DESC"]],
      raw: true,
    });
  }
}
