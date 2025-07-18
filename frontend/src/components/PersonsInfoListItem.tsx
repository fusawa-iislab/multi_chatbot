"use client";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { mutate } from "swr";
import type { PersonType } from "../types";

export const PersonsInfoListItem: React.FC<{
  person: PersonType;
  chatRoomId: number;
}> = ({ person, chatRoomId }) => {
  const [textareaIsOpen, setTextareaIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState<string>("");

  const ChatBotReply = async (personId: number) => {
    const resText = await fetch(`/api/chatrooms/${chatRoomId}/chat-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to get reply");
        mutate(`/api/chatrooms/${chatRoomId}`);
      })
      .catch((error) => {
        console.error("Error getting reply:", error);
      });
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) {
      alert("Please enter a message.");
      return;
    }

    if (!person.isUser) {
      alert("You can only send messages as a user.");
      return;
    }

    const res = await fetch(`/api/chatrooms/${chatRoomId}/user-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId: person.id, content: userMessage }),
    });

    if (!res.ok) {
      alert("Failed to send message");
      return;
    }

    setUserMessage("");
    setTextareaIsOpen(false);
    mutate(`/api/chatrooms/${chatRoomId}`);
  };

  return (
    <div className="flex flex-col bg-white shadow rounded-xl p-4 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-1">
        {person.name}
      </h2>
      <p className="flex-grow-1 text-gray-700 mb-2">{person.persona}</p>
      <div className="text-right">
        {person.isUser ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => {
              setTextareaIsOpen(!textareaIsOpen);
            }}
            type="button"
          >
            {textareaIsOpen ? "Cancel" : "Send Message"}
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            onClick={async () => await ChatBotReply(person.id)}
            type="button"
          >
            Reply
          </button>
        )}
      </div>
      {textareaIsOpen && person.isUser && (
        <div className="fixed bottom-0 left-0 right-0 w-screen flex flex-col items-center bg-gray-800 p-2">
          <button
            className="self-end p-2"
            onClick={() => setTextareaIsOpen(false)}
            type="button"
          >
            <CloseIcon className="text-gray-100" />
          </button>
          <textarea
            className="mt-2 w-7/8  p-2 border border-gray-400 rounded resize-none"
            rows={3}
            onChange={(e) =>
              setUserMessage((e.target as HTMLTextAreaElement).value)
            }
            value={userMessage}
          />
          <button
            className="self-end mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleSendMessage}
            type="button"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};
