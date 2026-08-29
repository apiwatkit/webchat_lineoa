import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "@/app/database/database";

export class ChatMessageModel extends Model<
  InferAttributes<ChatMessageModel>,
  InferCreationAttributes<ChatMessageModel>
> {
  declare id: CreationOptional<number>;
  declare roomId: number;

  declare messageType: "text" | "image" | "video" | "file" | "sticker";

  declare textContent: string | null;
  declare mediaUrl: string | null;
  declare fileName: string | null;
  declare stickerPackageId: string | null;
  declare stickerId: string | null;

  declare sender: "user" | "admin";
  declare lineMessageId: string | null;
  declare messageTimestamp: number;
  declare createdAt: CreationOptional<Date>;
}

ChatMessageModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    roomId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "room_id",
    },

    messageType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "message_type",
    },

    textContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "text_content",
    },

    mediaUrl: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      field: "media_url",
    },

    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "file_name",
    },

    stickerPackageId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "sticker_package_id",
    },

    stickerId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "sticker_id",
    },

    sender: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "sender",
    },

    lineMessageId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "line_message_id",
    },

    messageTimestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "message_timestamp",
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "chat_message",
    timestamps: true,
    updatedAt: false,
  },
);
