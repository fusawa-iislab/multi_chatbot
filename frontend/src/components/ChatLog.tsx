"use client";
import { useEffect, useRef } from "react";

type DisplayChatData = {
	name: string;
	content: string;
};

type ChatLogProps = {
	chatLog: DisplayChatData[];
};

export const ChatLog: React.FC<ChatLogProps> = ({ chatLog }) => {
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
			className="flex flex-col bg-gray-900 mb-4 w-[95%] max-h-[50vh] overflow-y-auto border border-gray-300 divide-y divide-gray-300"
		>
			{chatLog.map((chat) => (
				<div key={chat.content} className="p-2 bg-transparent">
					<p className="text-xs">{chat.name}:</p>
					<p>{chat.content}</p>
				</div>
			))}
		</div>
	);
};
