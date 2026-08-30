import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";

import { sequelize } from "@/app/database/database";
import { ChatMessageModel } from "./chat-message.models";

export class ChatRoomModel extends Model<
  InferAttributes<ChatRoomModel>,
  InferCreationAttributes<ChatRoomModel>
> {
  declare id: CreationOptional<number>;

  declare userId: string;
  declare displayName: string | null;
  declare pictureUrl: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare messages?: NonAttribute<ChatMessageModel[]>;
}

ChatRoomModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: "user_id",
    },

    displayName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "display_name",
    },

    pictureUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "picture_url",
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "chat_room",
    timestamps: true,
  },
);

ChatRoomModel.hasMany(ChatMessageModel, {
  sourceKey: "userId",
  foreignKey: "userId",
  as: "messages",
});
