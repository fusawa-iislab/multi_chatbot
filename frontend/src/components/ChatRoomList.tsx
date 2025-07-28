"use client";
import Link from "next/link";
import useSWR, { mutate } from "swr";

import { Plus, Trash } from "phosphor-react";

import type { ChatRoomType } from "../types";

const ChatRoomsFetcher = async (url: string): Promise<ChatRoomType[]> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	const data = await response.json();
	return data.chatRooms;
};

export const ChatRoomList = () => {
	const { data: chatRooms, error } = useSWR("/api/chatrooms", ChatRoomsFetcher);

	if (error) return <div>Failed to load</div>;
	if (!chatRooms) return <div>Loading...</div>;

	const handleDelete = async (
		e: React.MouseEvent<HTMLButtonElement>,
		chatRoomId: number,
	) => {
		e.stopPropagation();
		e.preventDefault();
		const res = await fetch(`/api/chatroom/${chatRoomId}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			alert("Failed to delete chat room");
			return;
		}
		mutate("/api/chatrooms");
	};

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4">Chat Rooms</h2>
			<Link href="/chatroom/create" className="flex items-center gap-2 my-4">
				<div className="flex flex-col items-center gap-2 px-10 py-4 border border-white rounded-lg shadow hover:shadow-lg transition-shadow">
					<Plus size={24} />
					<span>Create</span>
				</div>
			</Link>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{chatRooms.map((room) => (
					<Link key={room.id} href={`/chatroom/${room.id}`}>
						<div className="p-4 border rounded-lg shadow hover:shadow-lg transition-shadow flex items-center justify-between">
							<p className="text-lg font-semibold">{room.title}</p>
							<button onClick={(e) => handleDelete(e, room.id)} type="button">
								<Trash size={24} />
							</button>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};
