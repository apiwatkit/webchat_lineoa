import { ChatRoomModel } from "../models";

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
      order: [["updatedAt", "DESC"]],
      raw: true,
    });
  }
}
