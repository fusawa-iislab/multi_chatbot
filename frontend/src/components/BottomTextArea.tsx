"use client";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import { mutate } from "swr";

type BottomTextAreaProps = {
	chatRoomId: number;
	personId: number;
	setTextareaPersonId: (id: number | null) => void;
	personName: string;
};

export const BottomTextArea: React.FC<BottomTextAreaProps> = ({
	chatRoomId,
	personId,
	setTextareaPersonId,
	personName,
}) => {
	const [userMessage, setUserMessage] = useState<string>("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: personId change should clear message
	useEffect(() => {
		setUserMessage("");
	}, [personId]);

	const handleSendMessage = async (personId: number) => {
		if (!userMessage.trim()) {
			alert("Please enter a message.");
			return;
		}

		const res = await fetch(`/api/chatroom/${chatRoomId}/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ personId: personId, content: userMessage }),
		});

		if (!res.ok) {
			alert("Failed to send message");
			return;
		}

		setUserMessage("");
		setTextareaPersonId(null);
		mutate(`/api/chatroom/${chatRoomId}`);
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 w-screen flex flex-col items-center bg-gray-800 p-2">
			<div className="flex justify-between w-7/8 mb-2">
				<h1 className="text-gray-100">Reply as {personName}</h1>
				<button
					className="p-2"
					onClick={() => setTextareaPersonId(null)}
					type="button"
				>
					<CloseIcon className="text-gray-100" />
				</button>
			</div>
			<textarea
				className="mt-2 w-7/8  p-2 border border-gray-400 rounded resize-none"
				rows={3}
				onChange={(e) =>
					setUserMessage((e.target as HTMLTextAreaElement).value)
				}
				value={userMessage}
			/>
			<button
				className="self-end mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
				onClick={() => handleSendMessage(personId)}
				type="button"
			>
				Send
			</button>
		</div>
	);
};
