"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { CHATORDER_LOOP_INDENT } from "../config/design";
import type {
	ChatDataType,
	ChatOrderComment,
	ChatOrderItem,
	ChatOrderLoop,
	ChatRoomType,
} from "../types";
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
	const [parentIds, setParentIds] = useState<number[]>([]); //これもuseEffectでchatRoomのchatOrder.orderから取得する

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
		alert("Order saved successfully");
		mutate(`/api/chatroom/${chatRoomId}`);
	};

	const handleRunOrder = async () => {
		const response = await fetch(`/api/chatroom/${chatRoomId}/chat-order/run`, {
			method: "POST",
			body: JSON.stringify(order),
		});
		if (!response.ok) {
			alert("Failed to run order");
			return;
		}
		alert("Order run successfully");
		const data: ChatDataType[] = await response.json();
		console.log(data);
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Chat Order
				</h1>
			</div>

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
	);
};
