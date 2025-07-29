"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useRouter } from "next/navigation";

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
	const router = useRouter();
	const { chatRoomId } = useParams<{ chatRoomId: string }>();

	const { data: chatRoom, error: chatRoomError } = useSWR(
		chatRoomId ? `/api/chatroom/${chatRoomId}` : null,
		ChatRoomFetcher,
	);

	const isLoading = !chatRoom && !chatRoomError;

	const handleDelete = async (chatRoomId: string) => {
		const res = await fetch(`/api/chatroom/${chatRoomId}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			alert("Failed to delete chat room");
			return;
		}
		router.push("/");
	};
	if (isLoading) return <div>Loading...</div>;
	if (chatRoomError) return <div>Error loading chat room</div>;
	if (!chatRoom) return <div>No chat room found</div>;

	return (
		<div className="p-4 w-full">
			<div className="flex justify-between items-center p-2 mb-2">
				<h1 className="text-2xl font-bold mb-2">Chatroom</h1>
				<button 
					className="bg-red-500 text-white p-2 rounded-md w-[7rem]"
					onClick={() => handleDelete(chatRoomId)}
				>
					Delete
				</button>
			</div>
			{chatRoom.chatDatas.length > 0 && (
				<div className="w-full flex flex-col items-center mb-3">
					<h2 className="text-xl font-bold mb-2 self-start">Chat Log</h2>
					<ChatLog chatLog={chatRoom.chatDatas} />
				</div>
			)}
			<div>
				<PersonInfoList
					persons={chatRoom?.persons ?? []}
					chatRoomId={Number(chatRoomId)}
				/>
			</div>
		</div>
	);
};
