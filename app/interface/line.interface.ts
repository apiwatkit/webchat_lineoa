export interface LineChatMessageInterface {
  roomId?: number;

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
  id: number;
  userId: string;
  displayName?: string;
  pictureUrl?: string;
  messages: LineChatMessageInterface[];
}

export interface CreateLineChatMessageInterface {
  roomId: number;

  messageType: "text" | "image" | "video" | "file" | "sticker";

  textContent?: string;
  mediaUrl?: string;
  fileName?: string;

  stickerPackageId?: string;
  stickerId?: string;

  sender: "user" | "admin";

  lineMessageId?: string;

  messageTimestamp: number;
}
