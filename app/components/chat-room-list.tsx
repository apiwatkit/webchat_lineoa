"use client";

import { LineChatRoomInterface } from "@/app/interface";

interface Props {
  rooms: Record<string, LineChatRoomInterface>;
  selectedUserId: string;
  onSelectRoom: (userId: string) => void;
}

export default function ChatRoomList({
  rooms,
  selectedUserId,
  onSelectRoom,
}: Props) {
  const roomList = Object.values(rooms);

  return (
    <div
      style={{
        width: "300px",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "18px",
          fontWeight: "bold",
          fontSize: "18px",
          borderBottom: "1px solid #ddd",
        }}
      >
        Conversations
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {roomList.length === 0 && (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#888",
            }}
          >
            Waiting for LINE message...
          </div>
        )}

        {roomList.map((room) => {
          const isSelected =
            selectedUserId === room.userId;

          const lastMessage =
            room.messages[room.messages.length - 1];
          let lastMessageText = "";
          
          if (lastMessage?.type === "image") {
            lastMessageText = "รูปภาพ";
          } else if (lastMessage?.type === "video") {
            lastMessageText = "วิดีโอ";
          } else if (lastMessage?.type === "file") {
            lastMessageText = "ไฟล์";
          } else if (lastMessage?.type === "sticker") {
            lastMessageText = "สติกเกอร์";
          } else {
            lastMessageText = lastMessage?.text ?? "";
          }

          return (
            <div
              key={room.userId}
              onClick={() => onSelectRoom(room.userId)}
              style={{
                display: "flex",
                gap: "12px",
                padding: "14px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                background: isSelected
                  ? "#f2f2f2"
                  : "#ffffff",
              }}
            >
              {room.pictureUrl ? (
                <img
                  src={room.pictureUrl}
                  alt={room.displayName ?? "LINE User"}
                  width={48}
                  height={48}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#ddd",
                    flexShrink: 0,
                  }}
                />
              )}

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {room.displayName ?? room.userId}
                </div>

                {lastMessage && (
                  <div
                    style={{
                      marginTop: "5px",
                      color: "#777",
                      fontSize: "13px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lastMessageText}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}