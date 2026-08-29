"use client";

import { LineChatRoomInterface } from "@/app/interface";

interface Props {
  room?: LineChatRoomInterface;
  text: string;
  isSending: boolean;

  onChangeText: (text: string) => void;
  onSendMessage: () => void;
}

export default function ChatRoom({
  room,
  text,
  isSending,
  onChangeText,
  onSendMessage,
}: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "72px",
          padding: "12px 18px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {room ? (
          <>
            {room.pictureUrl && (
              <img
                src={room.pictureUrl}
                alt={room.displayName ?? "LINE User"}
                width={44}
                height={44}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            )}

            <div>
              <div style={{ fontWeight: "bold" }}>
                {room.displayName ?? room.userId}
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "11px",
                  color: "#888",
                }}
              >
                {room.userId}
              </div>
            </div>
          </>
        ) : (
          <span style={{ color: "#888" }}>
            Select conversation
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          background: "#f5f5f5",
        }}
      >
        {!room && (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
            }}
          >
            Select a conversation
          </div>
        )}

        {room?.messages.map((message, index) => {
          const isAdmin =
            message.sender === "admin";

          let messageContent = null;

          if (message.type === "text") {
            messageContent = (
              <p>{message.text}</p>
            );
          } else if (message.type === "image" && message.imageUrl) {
            messageContent = (
            <img 
              src={message.imageUrl} 
              alt="LINE message"
              width="150"
            />
            );
          } else if (message.type === "video" && message.videoUrl) {
            messageContent = (
              <video
                src={message.videoUrl}
                controls
                width="500"
              />
            );
          } else if (message.type === "file" && message.fileUrl) {
            messageContent = (
              <a
                href={message.fileUrl}
                download={message.fileName}
              >
                {message.fileName ?? "Download file"}
              </a>
            );
          } else if (message.type === "sticker") {
            messageContent = `Sticker ${message.stickerId}`;
          }

          return (
            <div
              key={`${message.timestamp}-${index}`}
              style={{
                display: "flex",
                justifyContent: isAdmin
                  ? "flex-end"
                  : "flex-start",
                marginBottom: "16px",
              }}
            >
              {!isAdmin && room.pictureUrl && (
                <img
                  src={room.pictureUrl}
                  alt={room.displayName ?? "LINE User"}
                  width={36}
                  height={36}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: "10px",
                  }}
                />
              )}

              <div
                style={{
                  maxWidth: "70%",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    background: isAdmin
                      ? "#c8f7d0"
                      : "#ffffff",
                    borderRadius: isAdmin
                      ? "14px 4px 14px 14px"
                      : "4px 14px 14px 14px",
                    border: isAdmin
                      ? "none"
                      : "1px solid #ddd",
                    wordBreak: "break-word",
                  }}
                >
                  {messageContent}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    textAlign: isAdmin
                      ? "right"
                      : "left",
                    fontSize: "10px",
                    color: "#999",
                  }}
                >
                  {new Date(
                    message.timestamp,
                  ).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          padding: "14px",
          gap: "10px",
          borderTop: "1px solid #ddd",
        }}
      >
        <input
          value={text}
          onChange={(event) =>
            onChangeText(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              onSendMessage();
            }
          }}
          disabled={!room}
          placeholder={
            room
              ? "พิมพ์ข้อความ..."
              : "เลือกห้องก่อน..."
          }
          style={{
            flex: 1,
            padding: "12px 14px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />

        <button
          type="button"
          onClick={onSendMessage}
          disabled={
            !room ||
            !text.trim() ||
            isSending
          }
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}