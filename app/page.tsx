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
  const [isSending, setIsSending] =
    useState(false);

  const selectedRoom = useMemo(() => {
    if (!selectedUserId) {
      return undefined;
    }

    return rooms[selectedUserId];
  }, [rooms, selectedUserId]);

  useEffect(() => {
    const eventSource = new EventSource(
      "/api/line/events",
    );

    eventSource.onmessage = (event) => {
      const message =
        JSON.parse(
          event.data,
        ) as LineChatMessageInterface;

      setRooms((current) => {
        const room = current[message.userId];

        return {
          ...current,

          [message.userId]: {
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

      setSelectedUserId((current) => {
        return current || message.userId;
      });
    };

    return () => {
      eventSource.close();
    };
  }, []);

  async function sendMessage() {
    if (
      !selectedUserId ||
      !text.trim() ||
      isSending
    ) {
      return;
    }

    const messageText = text.trim();

    try {
      setIsSending(true);

      const response = await fetch(
        "/api/line/send",
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
      setIsSending(false);
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
        onSelectRoom={setSelectedUserId}
      />

      <ChatRoom
        room={selectedRoom}
        text={text}
        isSending={isSending}
        onChangeText={setText}
        onSendMessage={sendMessage}
      />
    </main>
  );
}