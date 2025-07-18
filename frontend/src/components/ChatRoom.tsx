"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";

import type { ChatRoomType } from "../types";
import { ChatLog } from "./ChatLog";
import { PersonInfoList } from "./PersonsInfoList";

const ChatRoomFetcher = async (
  url: string,
): Promise<ChatRoomType | undefined> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch chat rooms");
    const data = await res.json();
    return data.chatRoom;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const ChatRoom = () => {
  const { id: chatRoomId } = useParams();

  const { data: chatRoom, error: chatRoomError } = useSWR(
    chatRoomId ? `/api/chatrooms/${chatRoomId}` : null,
    ChatRoomFetcher,
  );

  const isLoading = !chatRoom && !chatRoomError;

  if (isLoading) return <div>Loading...</div>;
  if (chatRoomError) return <div>Error loading chat room</div>;
  if (!chatRoom) return <div>No chat room found</div>;

  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-2">Chatroom</h1>
      <div className="w-full flex flex-col items-center mb-3">
        <h2 className="text-xl font-bold mb-2 self-start">Chat Log</h2>
        <ChatLog
          chatLog={(chatRoom?.chatDatas ?? []).map((chat) => ({
            name: chat.name,
            content: chat.content,
          }))}
        />
      </div>
      <div>
        <PersonInfoList
          persons={chatRoom?.persons ?? []}
          chatRoomId={Number(chatRoomId)}
        />
      </div>
    </div>
  );
};
