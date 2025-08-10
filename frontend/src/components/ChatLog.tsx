"use client";
import { useEffect, useRef } from "react";
import type { ChatDataType } from "../types";

type ChatLogProps = {
	chatLog: ChatDataType[];
	width?: string;
	height?: string;
};

export const ChatLog: React.FC<ChatLogProps> = ({
	chatLog,
	width = "95%",
	height = "50vh",
}) => {
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		setTimeout(() => {
			if (chatContainerRef.current) {
				chatContainerRef.current.scrollTop =
					chatContainerRef.current.scrollHeight;
			}
		}, 0);
	}, [chatLog]);

	return (
		<div
			ref={chatContainerRef}
			className="flex flex-col bg-gray-900 mb-4 overflow-y-auto border border-gray-300 divide-y divide-gray-300"
			style={{ width, height }}
		>
			{chatLog.map((chat) => (
				<div key={chat.id} className="p-2 bg-transparent">
					<p className="text-xs">{chat.name}:</p>
					<p>{chat.content}</p>
				</div>
			))}
		</div>
	);
};
