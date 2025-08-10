"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import { CHATORDER_LOOP_INDENT } from "../config/design";
import type {
	ChatOrderComment,
	ChatOrderItem,
	ChatOrderLoop,
	ChatRoomType,
} from "../types";
import { ChatLog } from "./ChatLog";
import { ChatOrderBlockField } from "./ChatOrderBlockField";

const ChatRoomFetcher = async (url: string): Promise<ChatRoomType> => {
	const res = await fetch(url);
	if (!res.ok) throw new Error("Failed to fetch chat room");
	const data = await res.json();
	console.log("API Response:", data);
	return data.chatRoom || data; // chatRoomプロパティがある場合はそれを使用、なければdataをそのまま使用
};

const calcParentIds = (order: ChatOrderItem[]): number[] => {
	const depths = new Set(order.map((item) => item.loopDepth));
	const parentIds: number[] = [];
	for (const depth of depths) {
		const items = order.filter((item) => item.loopDepth === depth);
		const maxIdItem = items.reduce((max, item) =>
			item.id > max.id ? item : max,
		);
		parentIds.push(maxIdItem.id);
	}
	return parentIds;
};

export const ChatOrder = () => {
	const { chatRoomId } = useParams<{ chatRoomId: string }>();
	const [order, setOrder] = useState<ChatOrderItem[]>([]);
	const [loopDepth, setLoopDepth] = useState(0);
	const [parentIds, setParentIds] = useState<number[]>([]);

	const ws = useRef<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [runnningMessage, setRunnningMessage] = useState("");
	const [openUserInput, setOpenUserInput] = useState(false);
	const [userInput, setUserInput] = useState("");

	const {
		data: chatRoom,
		error: chatRoomError,
		isLoading,
	} = useSWR<ChatRoomType>(
		chatRoomId ? `/api/chatroom/${chatRoomId}` : null,
		ChatRoomFetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		},
	);

	useEffect(() => {
		if (ws.current) {
			ws.current.close();
		}
		ws.current = new WebSocket(
			`${process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL}/api/chatroom/${chatRoomId}/chat-order/run`,
		);
		ws.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "message") {
				setRunnningMessage(data.content);
			} else if (data.type === "input-request") {
				setOpenUserInput(true);
				setRunnningMessage(data.content);
			} else if (data.type === "chat-response") {
				console.log(data.content);
				mutate(`/api/chatroom/${chatRoomId}`);
			} else if (data.type === "error") {
				alert(data.error ?? data.content ?? "WebSocket error");
			} else if (data.type === "end") {
				setIsRunning(false);
				alert(data.content ?? "Chat order finished");
			}
		};
		ws.current.onopen = () => {
			setIsConnected(true);
			console.log("WebSocket connected");
		};
		ws.current.onclose = () => {
			setIsConnected(false);
			console.log("WebSocket closed");
		};
		ws.current.onerror = (event) => {
			setIsConnected(false);
			setIsRunning(false);
			console.log("WebSocket error", event);
		};
		return () => {
			if (ws.current) {
				ws.current.close();
			}
		};
	}, [chatRoomId]);

	useEffect(() => {
		if (chatRoom?.chatOrder?.order) {
			setOrder(chatRoom.chatOrder.order);
			setParentIds(calcParentIds(chatRoom.chatOrder.order));
			if (chatRoom.chatOrder.order.length > 0) {
				setLoopDepth(
					chatRoom.chatOrder.order[chatRoom.chatOrder.order.length - 1]
						.loopDepth,
				);
			}
		}
	}, [chatRoom]);

	if (chatRoomError) return <div>Error: {chatRoomError.message}</div>;
	if (isLoading) return <div>Loading...</div>;
	if (!chatRoom) return <div>No chat room data found</div>;

	const handleAddComment = () => {
		const newComment: ChatOrderComment = {
			id: order.length + 1,
			type: "comment",
			personId: chatRoom.persons[0].id,
			parentId: parentIds.at(-1) || null,
			loopDepth: loopDepth,
		};

		setOrder([...order, newComment]);
	};

	const handleAddLoop = () => {
		const newLoop: ChatOrderLoop = {
			id: order.length + 1,
			type: "loop",
			iteration: 3, // Default iteration
			parentId: parentIds.at(-1) || null,
			loopDepth: loopDepth,
		};

		setParentIds([...parentIds, newLoop.id]);
		setOrder([...order, newLoop]);
		setLoopDepth(loopDepth + 1);
	};

	const handleEndLoop = () => {
		if (loopDepth === 0) return;
		setLoopDepth(loopDepth - 1);
		setParentIds(parentIds.slice(0, -1));
	};

	const handleReset = () => {
		if (!window.confirm("Are you sure you want to reset the order?")) {
			return;
		}
		setOrder([]);
		setLoopDepth(0);
		setParentIds([]);
	};

	const handleSaveOrder = async () => {
		const response = await fetch(`/api/chatroom/${chatRoomId}/chat-order`, {
			method: "POST",
			body: JSON.stringify(order),
		});
		if (!response.ok) {
			alert("Failed to save order");
			return;
		}
		mutate(`/api/chatroom/${chatRoomId}`);
		alert("Order saved successfully");
	};

	const handleRunOrder = async () => {
		if (!ws.current || !isConnected) {
			alert("WebSocket is not connected");
			return;
		}
		ws.current.send(JSON.stringify(order));
		setIsRunning(true);
		setRunnningMessage("Running... Please wait...");
		setOpenUserInput(false);
	};

	const handleResetChatLog = async () => {
		const response = await fetch(`/api/chatroom/${chatRoomId}/reset-chatlog`, {
			method: "POST",
		});
		if (!response.ok) {
			alert("Failed to reset chat log");
		}
		mutate(`/api/chatroom/${chatRoomId}`);
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center gap-2">
				<Link
					href={`/chatroom/${chatRoomId}`}
					className="flex items-center gap-2"
				>
					<button
						className="bg-transparent text-blue-500 p-2 rounded-md hover:bg-blue-100 transition-colors"
						type="button"
					>
						←
					</button>
				</Link>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Chat Order
				</h1>
			</div>
			<div className="flex gap-4">
				<div className="flex flex-col gap-2 w-1/2 overflow-x-auto">
					{order.length > 0 && (
						<ChatOrderBlockField
							order={order}
							persons={chatRoom.persons}
							setOrder={setOrder}
						/>
					)}

					<div
						className="flex flex-wrap gap-2 text-sm relative mb-2"
						style={{ left: `${CHATORDER_LOOP_INDENT * loopDepth}rem` }}
					>
						<button
							onClick={handleAddComment}
							className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
							type="button"
						>
							Add Comment
						</button>
						<button
							onClick={handleAddLoop}
							className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
							type="button"
						>
							Add Loop
						</button>
						{loopDepth > 0 && (
							<button
								onClick={handleEndLoop}
								className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition-colors"
								type="button"
							>
								End Loop
							</button>
						)}
						<button
							onClick={handleReset}
							className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
							type="button"
						>
							Reset
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={handleSaveOrder}
							type="button"
							className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition-colors"
						>
							Save
						</button>
						<button
							onClick={handleRunOrder}
							type="button"
							className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition-colors"
						>
							Save and Run
						</button>
					</div>
				</div>
				{chatRoom.chatDatas.length > 0 && (
					<div className="flex flex-col gap-2 w-1/2 h-full bg-gray-700 p-2 rounded-md">
						<div className="flex gap-4 items-center">
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">
								ChatLog
							</h2>
							<button
								onClick={handleResetChatLog}
								className="text-sm bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors w-[5rem]"
								type="button"
							>
								Reset Log
							</button>
						</div>
						{isRunning && (
							<div className="text-sm text-gray-500">{runnningMessage}</div>
						)}
						<ChatLog chatLog={chatRoom.chatDatas} maxHeight="70vh" />
					</div>
				)}
			</div>
			{openUserInput && (
				<div className="fixed bottom-0 left-0 right-0 w-screen flex flex-col items-center bg-gray-800 p-2">
					<textarea
						className="mt-2 w-7/8 p-2 border border-gray-400 rounded resize-none"
						rows={3}
						onChange={(e) =>
							setUserInput((e.target as HTMLTextAreaElement).value)
						}
						value={userInput}
					/>
					<button
						className="self-end mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
						onClick={() => {
							ws.current?.send(
								JSON.stringify({ type: "input", content: userInput }),
							);
							setOpenUserInput(false);
							setUserInput("");
						}}
						type="button"
					>
						Send
					</button>
				</div>
			)}
		</div>
	);
};
