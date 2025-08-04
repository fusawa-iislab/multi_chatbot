"use client";
import { useParams } from "next/navigation";
import { X } from "phosphor-react";
import { useState } from "react";
import useSWR from "swr";
import type { ChatRoomType } from "../types";
import type { PersonType } from "../types";

const ChatRoomFetcher = async (url: string): Promise<ChatRoomType> => {
	const res = await fetch(url);
	if (!res.ok) throw new Error("Failed to fetch chat room");
	const data = await res.json();
	console.log("API Response:", data);
	return data.chatRoom || data; // chatRoomプロパティがある場合はそれを使用、なければdataをそのまま使用
};

type Comment = {
	id: number;
	type: "comment";
	personId: number;
	parentId: number | null;
	loopDepth: number;
};

type Loop = {
	id: number;
	type: "loop";
	iteration: number;
	parentId: number | null;
	loopDepth: number;
};

type OrderItem = Comment | Loop;

const PersonList: React.FC<{
	persons: PersonType[];
	setIsPersonListOpen: (isOpen: boolean) => void;
}> = ({ persons, setIsPersonListOpen }) => {
	const chatbots = persons.filter((person) => !person.isUser);
	const users = persons.filter((person) => person.isUser);

	return (
		<div className="flex flex-col gap-2 p-2">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Person List
				</h2>
				<button
					onClick={() => setIsPersonListOpen(false)}
					className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
					type="button"
				>
					<X size={24} />
				</button>
			</div>
			{chatbots.length > 0 && (
				<div>
					<h2 className="text-gray-900 dark:text-white">Chatbots</h2>
					<div className="flex flex-col gap-2">
						{chatbots.map((person) => (
							<div key={person.id}>
								<p className="text-gray-700 dark:text-gray-300">
									{person.name}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
			{users.length > 0 && (
				<div>
					<h2 className="text-gray-900 dark:text-white">Users</h2>
					<div className="flex flex-col gap-2">
						{users.map((person) => (
							<div key={person.id}>
								<p className="text-gray-700 dark:text-gray-300">
									{person.name}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

const Comment: React.FC<{
	name: string;
}> = ({ name }) => {
	return (
		<div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md border border-blue-300 dark:border-blue-700">
			<p className="font-semibold text-gray-900 dark:text-white">
				Comment: {name}
			</p>
		</div>
	);
};

const Loop: React.FC<{
	iteration: number;
	onRemove: () => void;
	persons: PersonType[];
}> = ({ iteration, onRemove, persons }) => {
	const [numIteration, setNumIteration] = useState(iteration);
	return (
		<div className="bg-green-100 dark:bg-green-900 p-2 rounded-md border border-green-300 dark:border-green-700 max-w-xl">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center gap-2">
					<p className="font-semibold text-gray-900 dark:text-white">Loop</p>
					<input
						type="number"
						value={numIteration}
						onChange={(e) => setNumIteration(Number(e.target.value))}
						className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-1 w-[3rem] text-center "
						min={0}
						max={10}
					/>
				</div>
				<button
					onClick={onRemove}
					className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
					type="button"
				>
					Remove
				</button>
			</div>
		</div>
	);
};

const loopIndent: number = 3;

const OrderItemRenderer: React.FC<{
	item: OrderItem;
	persons: PersonType[];
}> = ({ item, persons }) => {
	const leftOffset = loopIndent * item.loopDepth;

	if (item.type === "comment") {
		return (
			<div
				className="flex flex-col gap-2 max-w-xl relative"
				style={{ left: `${leftOffset}rem` }}
			>
				<Comment
					name={
						persons.find((p) => p.id === item.personId)?.name ||
						`Person ${item.personId}`
					}
				/>
			</div>
		);
	}
	if (item.type === "loop") {
		return (
			<div
				className="flex flex-col gap-2 max-w-xl relative"
				style={{ left: `${leftOffset}rem` }}
			>
				<Loop
					iteration={item.iteration}
					onRemove={() => {}} // TODO: Implement remove
					persons={persons}
				/>
			</div>
		);
	}
	return null;
};

export const ChatOrder = () => {
	const [isPersonListOpen, setIsPersonListOpen] = useState(false);
	const [order, setOrder] = useState<OrderItem[]>([]);
	const [loopDepth, setLoopDepth] = useState(0);
	const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
	const [parentIds, setParentIds] = useState<number[]>([]);

	const { chatRoomId } = useParams<{ chatRoomId: string }>();
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

	if (chatRoomError) {
		return <div>Error: {chatRoomError.message}</div>;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!chatRoom) {
		return <div>No chat room data found</div>;
	}

	console.log("ChatRoom data:", chatRoom);

	const handleAddComment = () => {
		if (selectedPersonId === null) {
			alert("Please select a person first");
			return;
		}

		const newComment: Comment = {
			id: order.length + 1,
			type: "comment",
			personId: selectedPersonId,
			parentId: parentIds.at(-1) || null,
			loopDepth: loopDepth,
		};

		setOrder([...order, newComment]);
	};

	const handleAddLoop = () => {
		const newLoop: Loop = {
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
		setSelectedPersonId(null);
		setParentIds([]);
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Chat Order
				</h1>
				<button
					onClick={() => setIsPersonListOpen(!isPersonListOpen)}
					className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition-colors"
					type="button"
				>
					{isPersonListOpen ? "Hide" : "Show"} Person List
				</button>
			</div>

			{isPersonListOpen && (
				<PersonList
					persons={chatRoom.persons}
					setIsPersonListOpen={setIsPersonListOpen}
				/>
			)}

			{/* Person Selection */}
			<div className="flex flex-col gap-2">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
					Select Person for Comment:
				</h3>
				<div className="flex flex-wrap gap-2">
					{chatRoom.persons?.map((person) => (
						<button
							key={person.id}
							onClick={() => setSelectedPersonId(person.id)}
							className={`p-2 rounded-md transition-colors ${
								selectedPersonId === person.id
									? "bg-blue-500 text-white"
									: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
							}`}
							type="button"
						>
							{person.name}
						</button>
					))}
				</div>
			</div>

			{/* Order Display */}
			{order.length > 0 && (
				<div className="flex flex-col gap-2 max-w-2xl">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						Current Order:
					</h3>
					{order.map((item, index) => (
						<OrderItemRenderer
							key={item.id}
							item={item}
							persons={chatRoom.persons}
						/>
					))}
				</div>
			)}

			{/* Control Buttons */}
			<div
				className="flex flex-wrap gap-2 text-sm relative"
				style={{ left: `${loopIndent * loopDepth}rem` }}
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
		</div>
	);
};
