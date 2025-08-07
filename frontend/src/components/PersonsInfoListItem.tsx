"use client";
import CloseIcon from "@mui/icons-material/Close";
import { Wrench } from "phosphor-react";
import { useState } from "react";
import { mutate } from "swr";
import type { PersonType } from "../types";

export const PersonsInfoListItem: React.FC<{
	person: PersonType;
	chatRoomId: number;
}> = ({ person, chatRoomId }) => {
	const [textareaIsOpen, setTextareaIsOpen] = useState(false);
	const [userMessage, setUserMessage] = useState<string>("");
	const [editMode, setEditMode] = useState(false);
	const [savedName, setSavedName] = useState<string>(person.name);
	const [savedPersona, setSavedPersona] = useState<string>(person.persona);

	const ChatBotReply = async (personId: number) => {
		await fetch(`/api/chatroom/${chatRoomId}/chat-reply`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ personId }),
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to get reply");
				mutate(`/api/chatroom/${chatRoomId}`);
			})
			.catch((error) => {
				console.error("Error getting reply:", error);
			});
	};

	const handleSendMessage = async () => {
		if (!userMessage.trim()) {
			alert("Please enter a message.");
			return;
		}

		if (!person.isUser) {
			alert("You can only send messages as a user.");
			return;
		}

		const res = await fetch(`/api/chatroom/${chatRoomId}/user-chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ personId: person.id, content: userMessage }),
		});

		if (!res.ok) {
			alert("Failed to send message");
			return;
		}

		setUserMessage("");
		setTextareaIsOpen(false);
		mutate(`/api/chatroom/${chatRoomId}`);
	};

	const personEditHandler = async () => {
		if (!editMode) {
			setEditMode(true);
		} else {
			setEditMode(false);
			setSavedName("");
			setSavedPersona("");
		}
	};

	const setPersonInfo = async (
		newName: string,
		newPersona: string,
		personId: number,
	) => {
		if (newName === "") {
			newName === person.name;
		}
		if (newPersona === "") {
			newPersona === person.persona;
		}
		if (newName !== person.name || newPersona !== person.persona) {
			const res = await fetch(`/api/chatroom/${chatRoomId}`, {
				method: "POST",
				body: JSON.stringify({
					name: newName,
					persona: newPersona,
					chatRoomId: chatRoomId,
					personId: personId,
				}),
			});
			if (!res.ok) {
				alert("Failed to update person info");
				return;
			}
			console.log("Person info updated successfully");
			mutate(`/api/chatroom/${chatRoomId}`);
		}
	};

	return (
		<div
			className={
				editMode
					? "flex flex-col bg-blue-100 shadow rounded-xl p-4 border border-black"
					: "flex flex-col bg-white shadow rounded-xl p-4 border border-gray-200"
			}
		>
			<h2 className="text-lg font-semibold text-gray-700 mb-1 flex items-center justify-between"
				style={{ minHeight: "35px" }}>
				{!editMode ? (
					person.name
				) : (
					<textarea
						className="resize-none"
						onChange={(e) => setSavedName(e.target.value)}
						rows={1}
						placeholder={person.name}
					></textarea>
				)}
				{!editMode && (
					<button
						onClick={() => {
							personEditHandler();
							setTextareaIsOpen(false);
						}}
						type="button"
					>
						<Wrench size={35} />
					</button>
				)}
			</h2>

			<p className="flex-grow-1 text-gray-700 mb-2">
				{editMode && !person.isUser ? (
					<textarea
						className="resize-none"
						defaultValue={person.persona}
						maxLength={500}
						cols={37}
						onChange={(e) => setSavedPersona(e.target.value)}
					></textarea>
				) : (
					<textarea
						className="resize-none"
						value={person.persona}
						cols={37}
						readOnly
						disabled
					></textarea>
				)}
			</p>

			{!editMode && (
				<div className="text-right">
					{person.isUser ? (
						<button
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
							onClick={() => {
								setTextareaIsOpen(!textareaIsOpen);
							}}
							type="button"
						>
							{textareaIsOpen ? "Cancel" : "Send Message"}
						</button>
					) : (
						<button
							className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
							onClick={async () => await ChatBotReply(person.id)}
							type="button"
						>
							Reply
						</button>
					)}
				</div>
			)}

			{editMode && (
				<div className="text-right">
					<button
						className={"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"}
						onClick={async () => {
							await setEditMode(false);
						}}
					>
						Cancel
					</button>

					{/* Spacing between "cancel" and "confirm" buttons */}
					<a className="px-2"></a>

					{person.isUser ? (
						/* User confirm requirements */
						<button
							className={
								savedName !== "" && savedName !== person.name
									? "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
									: "px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
							}
							onClick={async () => {
								await setPersonInfo(savedName, savedPersona, person.id);
								setEditMode(false);
							}}
							type="button"
							disabled={savedName === "" || savedName === person.name}
						>
							Confirm
						</button>
					) : (
						/* Chatbot confirm requirements */
						<button
							className={
								(savedName !== "" && savedName !== person.name) ||
									(savedPersona !== "" && savedPersona !== person.persona)
									? "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
									: "px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
							}
							onClick={async () => {
								await setPersonInfo(savedName, savedPersona, person.id);
								setEditMode(false);
							}}
							type="button"
							disabled={
								(savedName === "" || savedName === person.name) &&
								(savedPersona === "" || savedPersona === person.persona)
							}
						>
							Confirm
						</button>
					)}
				</div>
			)}

			{textareaIsOpen && person.isUser && (
				<div className="fixed bottom-0 left-0 right-0 w-screen flex flex-col items-center bg-gray-800 p-2">
					<button
						className="self-end p-2"
						onClick={() => setTextareaIsOpen(false)}
						type="button"
					>
						<CloseIcon className="text-gray-100" />
					</button>
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
						onClick={handleSendMessage}
						type="button"
					>
						Send
					</button>
				</div>
			)}
		</div>
	);
};
