export interface LineChatMessageInterface {
  userId: string;
  type: "text" | "image" | "video" | "file" | "sticker";

  text?: string;

  imageUrl?: string;

  videoUrl?: string;

  fileUrl?: string;
  fileName?: string;

  stickerPackageId?: string;
  stickerId?: string;

  displayName?: string;
  pictureUrl?: string;
  timestamp: number;
  sender?: "user" | "admin";
}

export interface LineChatRoomInterface {
  userId: string;
  displayName?: string;
  pictureUrl?: string;
  messages: LineChatMessageInterface[];
}
