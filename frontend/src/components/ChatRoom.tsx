"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "phosphor-react";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";

import type { ChatRoomType } from "../types";
import { BottomTextArea } from "./BottomTextArea";
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

const handleUpdateTitle = async (
	chatRoomId: number,
	currentTitle: string,
	newTitle: string,
	setChatRoomEditingTitle: (title: string) => void,
) => {
	if (currentTitle === newTitle) {
		return;
	}
	if (newTitle === "") {
		alert("Title cannot be empty");
		setChatRoomEditingTitle(currentTitle);
		return;
	}
	if (
		!window.confirm(
			`Are you sure you want to update the title from "${currentTitle}" to "${newTitle}"?`,
		)
	) {
		return;
	}

	const res = await fetch(`/api/chatroom/${chatRoomId}/title`, {
		method: "PUT",
		body: JSON.stringify({ title: newTitle }),
	});
	if (!res.ok) {
		alert("Failed to update title");
		setChatRoomEditingTitle(currentTitle);
		return;
	}
	await mutate(`/api/chatroom/${chatRoomId}`);
};

export const ChatRoom = () => {
	const router = useRouter();
	const { chatRoomId } = useParams<{ chatRoomId: string }>();

	const { data: chatRoom, error: chatRoomError } = useSWR(
		chatRoomId ? `/api/chatroom/${chatRoomId}` : null,
		ChatRoomFetcher,
	);

	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [chatRoomEditingTitle, setChatRoomEditingTitle] = useState("");

	const [textareaPersonId, setTextareaPersonId] = useState<number | null>(null);

	// chatRoomが読み込まれたときにchatRoomEditingTitleを更新
	useEffect(() => {
		if (chatRoom?.title) {
			setChatRoomEditingTitle(chatRoom.title);
		}
	}, [chatRoom?.title]);

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
				<Link
					href="/chatrooms"
					className="flex items-center gap-1 text-blue-500"
				>
					<ArrowLeft size={24} /> Back
				</Link>

				<button
					className="bg-red-500 text-white p-2 rounded-md w-[5rem] hover:bg-red-600 transition-colors"
					onClick={() => handleDelete(chatRoomId)}
					type="button"
				>
					Delete
				</button>
			</div>
			<h1 className="text-2xl font-bold mb-4">Chatroom</h1>
			<div className="flex gap-4 mb-4">
				<Link
					href={`/chatroom/${chatRoomId}/order`}
					className="text-blue-500 bg-blue-100 p-2 rounded-md"
				>
					order
				</Link>
			</div>
			<div className="flex flex-col gap-2 mb-4">
				<h2 className="text-xl font-bold mb-2">Title</h2>
				{isEditingTitle ? (
					<div className="flex items-center gap-2">
						<input
							className="text-xl mb-2"
							type="text"
							value={chatRoomEditingTitle}
							onChange={(e) => setChatRoomEditingTitle(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									setIsEditingTitle(false);
									setChatRoomEditingTitle(chatRoom.title);
								}
							}}
						/>
						<button
							className="bg-blue-500 text-white p-2 rounded-md w-[5rem] hover:bg-blue-600 transition-colors"
							onClick={async (e) => {
								e.preventDefault();
								await handleUpdateTitle(
									Number(chatRoomId),
									chatRoom.title,
									chatRoomEditingTitle,
									setChatRoomEditingTitle,
								);
								setIsEditingTitle(false);
							}}
							type="button"
						>
							Save
						</button>
						<button
							className="bg-gray-500 text-white p-2 rounded-md w-[5rem] hover:bg-gray-600 transition-colors"
							onClick={() => {
								setIsEditingTitle(false);
								setChatRoomEditingTitle(chatRoom.title);
							}}
							type="button"
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						className="text-xl mb-2 cursor-pointer text-left bg-transparent border-none p-0"
						onClick={() => setIsEditingTitle(true)}
						type="button"
					>
						{chatRoom.title}
					</button>
				)}
			</div>
			<div>
				<PersonInfoList
					persons={chatRoom?.persons ?? []}
					chatRoomId={Number(chatRoomId)}
					textareaPersonId={textareaPersonId}
					setTextareaPersonId={setTextareaPersonId}
				/>
			</div>
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
			{textareaPersonId && (
				<BottomTextArea
					chatRoomId={Number(chatRoomId)}
					personId={textareaPersonId}
					setTextareaPersonId={setTextareaPersonId}
					personName={
						chatRoom.persons.find((person) => person.id === textareaPersonId)
							?.name || ""
					}
				/>
			)}
		</div>
	);
};
