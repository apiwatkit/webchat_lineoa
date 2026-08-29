export interface LineChatMessageInterface {
  userId: string;
  text: string;
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
