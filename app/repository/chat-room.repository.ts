import { ChatMessageModel, ChatRoomModel } from "../models";

export class ChatRoomRepository {
  async findByUserId(userId: string) {
    return ChatRoomModel.findOne({
      where: {
        userId,
      },
      raw: true,
    });
  }

  async create(userId: string, displayName?: string, pictureUrl?: string) {
    return ChatRoomModel.create({
      userId,
      displayName: displayName ?? null,
      pictureUrl: pictureUrl ?? null,
    });
  }

  async findAll() {
    return ChatRoomModel.findAll({
      include: [
        {
          model: ChatMessageModel,
          as: "messages",
          separate: true,
          limit: 1,
          order: [["messageTimestamp", "DESC"]],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
  }
}
