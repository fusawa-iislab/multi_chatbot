"use client";
import Link from "next/link";
import useSWR from "swr";

import type { ChatRoomType } from "../types";

const ChatRoomFetcher = async (url: string): Promise<ChatRoomType[]> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	const data = await response.json();
	return data.chatRooms;
};

export const ChatRoomList = () => {
	const { data: chatRooms, error } = useSWR("/api/chatrooms", ChatRoomFetcher);

	if (error) return <div>Failed to load</div>;
	if (!chatRooms) return <div>Loading...</div>;

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">Chat Rooms</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{chatRooms.map((room) => (
					<Link key={room.id} href={`/chatrooms/${room.id}`}>
						<div className="p-4 border rounded-lg shadow hover:shadow-lg transition-shadow">
							<p className="text-lg font-semibold">{room.title}</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};
