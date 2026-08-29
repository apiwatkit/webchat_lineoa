"use client";

import { useEffect, useMemo, useState } from "react";

import ChatRoom from "@/app/components/chat-room";
import ChatRoomList from "@/app/components/chat-room-list";

import {
  LineChatMessageInterface,
  LineChatRoomInterface,
} from "@/app/interface";

export default function Home() {
  const [rooms, setRooms] = useState<
    Record<string, LineChatRoomInterface>
  >({});

  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [text, setText] = useState("");
  const [isReplying, setIsReplying] =
    useState(false);

  const selectedRoom = useMemo(() => {
    if (!selectedUserId) {
      return undefined;
    }

    return rooms[selectedUserId];
  }, [rooms, selectedUserId]);

  async function getRooms() {
    const response = await fetch("/api/line/room");

    if (!response.ok) {
      return;
    }

    const result = await response.json();

    const roomMap: Record<
      string,
      LineChatRoomInterface
    > = {};

    for (const room of result.data) {
      const messages: LineChatMessageInterface[] = [];

      if (room.latestMessage) {
        const latestMessage =
          room.latestMessage;

        const message: LineChatMessageInterface = {
          roomId: room.id,
          userId: room.userId,
          type: latestMessage.messageType,
          sender: latestMessage.sender,
          timestamp: Number(
            latestMessage.messageTimestamp,
          ),
        };

        if (latestMessage.messageType === "text") {
          message.text =
            latestMessage.textContent;
        } else if (
          latestMessage.messageType === "image"
        ) {
          message.imageUrl =
            latestMessage.mediaUrl;
        } else if (
          latestMessage.messageType === "video"
        ) {
          message.videoUrl =
            latestMessage.mediaUrl;
        } else if (
          latestMessage.messageType === "file"
        ) {
          message.fileUrl =
            latestMessage.mediaUrl;
          message.fileName =
            latestMessage.fileName;
        } else if (
          latestMessage.messageType === "sticker"
        ) {
          message.stickerPackageId =
            latestMessage.stickerPackageId;
          message.stickerId =
            latestMessage.stickerId;
        }

        messages.push(message);
      }

      roomMap[room.userId] = {
        id: room.id,
        userId: room.userId,
        displayName: room.displayName,
        pictureUrl: room.pictureUrl,
        messages,
      };
    }

    setRooms(roomMap);
  }

  async function handleSelectRoom(
    userId: string,
  ) {
    setSelectedUserId(userId);

    const room = rooms[userId];

    if (!room) {
      return;
    }

    await getMessages(
      userId,
      room.id,
    );
  }

  async function getMessages(
    userId: string,
    roomId: number,
  ) {
    const response = await fetch(
      `/api/line/message?roomId=${roomId}`,
    );

    if (!response.ok) {
      return;
    }

    const result = await response.json();

    const messages: LineChatMessageInterface[] =
      result.data.map(
        (message: any) => {
          const data: LineChatMessageInterface = {
            userId,
            type: message.messageType,
            timestamp: Number(
              message.messageTimestamp,
            ),
            sender: message.sender,
          };

          if (message.messageType === "text") {
            data.text = message.textContent;
          } else if (
            message.messageType === "image"
          ) {
            data.imageUrl = message.mediaUrl;
          } else if (
            message.messageType === "video"
          ) {
            data.videoUrl = message.mediaUrl;
          } else if (
            message.messageType === "file"
          ) {
            data.fileUrl = message.mediaUrl;
            data.fileName = message.fileName;
          } else if (
            message.messageType === "sticker"
          ) {
            data.stickerPackageId =
              message.stickerPackageId;

            data.stickerId =
              message.stickerId;
          }

          return data;
        },
      );

    setRooms((current) => {
      const room = current[userId];

      if (!room) {
        return current;
      }

      return {
        ...current,

        [userId]: {
          ...room,
          messages,
        },
      };
    });
  }

  useEffect(() => {
    getRooms();

    const eventSource = new EventSource(
      "/api/line/events",
    );

    eventSource.onmessage = (event) => {
      const message =
        JSON.parse(event.data) as LineChatMessageInterface;

      setRooms((current) => {
        const room = current[message.userId];

        return {
          ...current,

          [message.userId]: {
            id: room?.id ?? message.roomId!,
            userId: message.userId,

            displayName:
              message.displayName ??
              room?.displayName,

            pictureUrl:
              message.pictureUrl ??
              room?.pictureUrl,

            messages: [
              ...(room?.messages ?? []),
              message,
            ],
          },
        };
      });
    };

    return () => {
      eventSource.close();
    };
  }, []);

  async function replyMessage() {
    if (
      !selectedUserId ||
      !text.trim() ||
      isReplying
    ) {
      return;
    }

    const messageText = text.trim();

    try {
      setIsReplying(true);

      const response = await fetch(
        "/api/line/reply",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            userId: selectedUserId,
            text: messageText,
          }),
        },
      );

      if (!response.ok) {
        return;
      }

      const message: LineChatMessageInterface =
        {
          userId: selectedUserId,
          type: "text",
          text: messageText,
          timestamp: Date.now(),
          sender: "admin",
        };

      setRooms((current) => {
        const room =
          current[selectedUserId];

        if (!room) {
          return current;
        }

        return {
          ...current,

          [selectedUserId]: {
            ...room,

            messages: [
              ...room.messages,
              message,
            ],
          },
        };
      });

      setText("");
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <main
      style={{
        width: "1000px",
        height: "700px",
        margin: "40px auto",
        border: "1px solid #ddd",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
      }}
    >
      <ChatRoomList
        rooms={rooms}
        selectedUserId={selectedUserId}
        onSelectRoom={handleSelectRoom}
      />

      <ChatRoom
        room={selectedRoom}
        text={text}
        isReplying={isReplying}
        onChangeText={setText}
        onReplyMessage={replyMessage}
      />
    </main>
  );
}