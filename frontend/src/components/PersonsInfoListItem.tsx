"use client";
import { Wrench } from "phosphor-react";
import { useState } from "react";
import { mutate } from "swr";
import type { PersonType } from "../types";

export const PersonsInfoListItem: React.FC<{
	person: PersonType;
	chatRoomId: number;
	textareaPersonId: number | null;
	setTextareaPersonId: (id: number | null) => void;
}> = ({ person, chatRoomId, textareaPersonId, setTextareaPersonId }) => {
	const [editMode, setEditMode] = useState(false);
	const [savedName, setSavedName] = useState<string>(person.name);
	const [savedPersona, setSavedPersona] = useState<string>(person.persona);

	const ChatBotReply = async (personId: number) => {
		await fetch(`/api/chatroom/${chatRoomId}/auto-reply`, {
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
		let realNewName = newName;
		let realNewPersona = newPersona;
		if (newName === "") {
			realNewName = person.name;
		}
		if (newPersona === "") {
			realNewPersona = person.persona;
		}
		if (realNewName !== person.name || realNewPersona !== person.persona) {
			const res = await fetch(`/api/chatroom/${chatRoomId}`, {
				method: "POST",
				body: JSON.stringify({
					name: realNewName,
					persona: realNewPersona,
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
			<h2 className="text-lg font-semibold text-gray-700 mb-1 flex items-center justify-between">
				{!editMode ? (
					person.name
				) : (
					<textarea
						className="resize-none"
						onChange={(e) => setSavedName(e.target.value)}
						rows={1}
						placeholder={person.name}
					/>
				)}
				{!editMode && (
					<button
						onClick={() => {
							personEditHandler();
							setTextareaPersonId(null);
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
					/>
				) : (
					<textarea
						className="resize-none"
						value={person.persona}
						cols={37}
						readOnly
						disabled
					/>
				)}
			</p>

			{!editMode && (
				<div className="self-end">
					{person.isUser ? (
						<button
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
							onClick={() => {
								setTextareaPersonId(person.id);
							}}
							type="button"
						>
							{textareaPersonId === person.id ? "Cancel" : "Send"}
						</button>
					) : (
						<div className="flex gap-2 self-end">
							<button
								className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
								onClick={() => {
									setTextareaPersonId(person.id);
								}}
								type="button"
							>
								{textareaPersonId === person.id
									? "Cancel"
									: `Reply as ${person.name}`}
							</button>
							<button
								className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
								onClick={async () => await ChatBotReply(person.id)}
								type="button"
							>
								Generate
							</button>
						</div>
					)}
				</div>
			)}

			{editMode && (
				<div className="text-right flex gap-2 self-end">
					<button
						className={
							"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
						}
						onClick={async () => {
							await setEditMode(false);
						}}
						type="button"
					>
						Cancel
					</button>

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
		</div>
	);
};
