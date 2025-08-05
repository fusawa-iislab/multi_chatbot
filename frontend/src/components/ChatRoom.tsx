"use client";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

import { ArrowLeft } from "phosphor-react";

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
		if (!window.confirm("Are you sure you want to delete this chat room?")) {
			return;
		}
		const res = await fetch(`/api/chatroom/${chatRoomId}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			alert("Failed to delete chat room");
			return;
		}
		router.push("/");
	};

	const handleResetChatLog = async (chatRoomId: string) => {
		if (!window.confirm("Are you sure you want to reset the chat log?")) {
			return;
		}
		const res = await fetch(`/api/chatroom/${chatRoomId}/reset-chatlog`, {
			method: "POST",
		});
		if (!res.ok) {
			alert("Failed to reset chat log");
			return;
		}
		router.refresh();
		// チャットリセットの際ページに反映されない場合もあるため、リロードで強制的更新を行う
		window.location.reload();
	};

	if (isLoading) return <div>Loading...</div>;
	if (chatRoomError) return <div>Error loading chat room</div>;
	if (!chatRoom) return <div>No chat room found</div>;

	return (
		<div className="p-2 w-full">
			<div className="flex justify-between items-center px-2">
				<button
					className="bg-transparent text-blue-500 p-2 rounded-md flex items-center gap-1 hover:bg-blue-500 hover:text-white transition-colors"
					onClick={() => router.push("/chatrooms")}
					type="button"
				>
					<ArrowLeft size={24} /> Back
				</button>

				<button
					className="bg-red-500 text-white p-2 rounded-md w-[5rem] hover:bg-red-600 transition-colors"
					onClick={() => handleDelete(chatRoomId)}
					type="button"
				>
					Delete
				</button>
			</div>
			<h1 className="text-2xl font-bold mb-4">Chatroom</h1>
			{chatRoom.chatDatas.length > 0 && (
				<div className="w-full flex flex-col items-center mb-3">
					<div className="flex items-center gap-4 self-start mb-2">
						<h2 className="text-xl font-bold mb-2">Chat Log</h2>
						<button
							className="bg-blue-500 text-white text-sm p-2 rounded-md flex items-center"
							onClick={() => handleResetChatLog(chatRoomId)}
							type="button"
						>
							Reset Log
						</button>
					</div>
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
