import { CreateLineChatMessageInterface } from "../interface";
import { ChatMessageModel } from "../models";

export class ChatMessageRepository {
  async create(data: CreateLineChatMessageInterface) {
    return ChatMessageModel.create({
      roomId: data.roomId,
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

  async findByRoomId(roomId: number) {
    return ChatMessageModel.findAll({
      where: {
        roomId,
      },
      order: [["messageTimestamp", "ASC"]],
      raw: true,
    });
  }

  async findLatestByRoomId(roomId: number) {
    return ChatMessageModel.findOne({
      where: {
        roomId,
      },
      order: [["messageTimestamp", "DESC"]],
      raw: true,
    });
  }
}
