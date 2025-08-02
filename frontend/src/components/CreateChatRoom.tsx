"use client";
import { useRouter } from "next/navigation";
import { CaretLeft, CaretRight } from "phosphor-react";
import { useEffect, useState } from "react";

type ChatRoomInputType = {
	title: string;
	chatbots: {
		name: string;
		persona: string;
	}[];
	users: {
		name: string;
		// Could add more fields.
	}[];
};

const handlePersonNumberChange = (
	num: number,
	setNum: (num: number) => void,
	index: number,
	setIndex: (index: number) => void,
) => {
	setNum(num);
	if (num === 0) {
		setIndex(0);
	} else if (index >= num) {
		setIndex(num - 1);
	}
};

export const CreateChatRoom = () => {
	const router = useRouter();
	const [chatbotNum, setChatbotNum] = useState<number>(0);
	const [userNum, setUserNum] = useState<number>(0);
	const [chatRoomInput, setChatRoomInput] = useState<ChatRoomInputType>({
		title: "",
		chatbots: [],
		users: [],
	});
	const [chatbotIndex, setChatbotIndex] = useState<number>(0);
	const [userIndex, setUserIndex] = useState<number>(0);
	const [disableSubmitButton, setDisableSubmitButton] =
		useState<boolean>(false);
	const [userView, setUserView] = useState<boolean>(false);

	useEffect(() => {
		setChatRoomInput((prev) => ({
			title: prev.title,
			chatbots: Array.from({ length: chatbotNum }, (_, index) => ({
				name: prev.chatbots[index]?.name || "",
				persona: prev.chatbots[index]?.persona || "",
			})),
			users: Array.from({ length: userNum }, (_, index) => ({
				name: prev.users[index]?.name || "",
			})),
		}));
	}, [chatbotNum, userNum]);

	const handleCreateChatRoom = async (chatRoomInput: ChatRoomInputType) => {
		setDisableSubmitButton(true);
		const chatbots = chatRoomInput.chatbots.map((chatbot) => ({
			name: chatbot.name,
			persona: chatbot.persona,
			isUser: false,
		}));

		const users = chatRoomInput.users.map((user) => ({
			name: user.name,
			isUser: true,
		}));

		const persons = [...chatbots, ...users];

		const data = {
			title: chatRoomInput.title,
			persons: persons,
		};
		const res = await fetch("/api/chatroom/create", {
			method: "POST",
			body: JSON.stringify(data),
		});
		if (res.ok) {
			const data = await res.json();
			console.log("Chat room created", data);
			const chatRoomId = data.chatRoomId;
			router.push(`/chatroom/${chatRoomId}`);
		} else {
			console.error("Failed to create chat room");
			alert("Failed to create chat room");
			setDisableSubmitButton(false);
		}
	};

	return (
		<div className="p-4 flex flex-col items-center">
			<h1 className="text-2xl font-bold mb-4">Create Chat Room</h1>
			<div className="flex flex-col gap-6 w-full max-w-2xl">
				<div className="flex flex-col gap-2">
					<label htmlFor="title">Title:</label>
					<input
						type="text"
						id="title"
						placeholder="Chat Room Name"
						className="p-2 border border-gray-300 rounded-md w-full max-w-2xl w-full"
						required
						value={chatRoomInput.title}
						onChange={(e) =>
							setChatRoomInput({ ...chatRoomInput, title: e.target.value })
						}
					/>
				</div>
				<div className="flex gap-4">
					<div className="flex gap-4 items-center">
						<button
							// Toggle to persons information view
							className={
								!userView
									? "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
									: "px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
							}
							onClick={() => setUserView(false)}
							type="button"
						>
							Persons:
						</button>
						<input
							type="number"
							id="persons"
							className="p-2 border border-gray-300 rounded-md w-[5rem]"
							value={chatbotNum}
							onChange={(e) => {
								handlePersonNumberChange(
									Number(e.target.value),
									setChatbotNum,
									chatbotIndex,
									setChatbotIndex,
								);
							}}
							min={0}
							max={10}
							required
						/>
					</div>
					{/* User mode button */}
					<div className="flex gap-4 items-center">
						<button
							// Toggle to persons information view
							className={
								userView
									? "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
									: "px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
							}
							onClick={() => setUserView(true)}
							type="button"
						>
							Users:
						</button>
						<input
							type="number"
							id="users"
							className="p-2 border border-gray-300 rounded-md w-[5rem]"
							value={userNum}
							onChange={(e) => {
								handlePersonNumberChange(
									Number(e.target.value),
									setUserNum,
									userIndex,
									setUserIndex,
								);
							}}
							min={0}
							max={10}
						/>
					</div>
				</div>

				{/* Options for AI "persons" */}
				<div>
					{chatRoomInput.chatbots.length > 0 && !userView && (
						<div className="flex flex-col gap-2">
							<div className="flex flex-col gap-2">
								<label htmlFor={"name"}>Name:</label>
								<input
									type="text"
									id={"name"}
									className="p-2 border border-gray-300 rounded-md w-full max-w-2xl"
									placeholder="Enter name"
									value={chatRoomInput.chatbots[chatbotIndex]?.name || ""}
									onChange={(e) =>
										setChatRoomInput({
											...chatRoomInput,
											chatbots: chatRoomInput.chatbots.map((p, i) =>
												i === chatbotIndex ? { ...p, name: e.target.value } : p,
											),
										})
									}
								/>
								<label htmlFor={"persona"}>Persona:</label>
								<textarea
									id={"persona"}
									className="p-2 border border-gray-300 rounded-md w-full h-24 resize-none"
									placeholder="Enter persona description"
									value={chatRoomInput.chatbots[chatbotIndex]?.persona || ""}
									onChange={(e) =>
										setChatRoomInput({
											...chatRoomInput,
											chatbots: chatRoomInput.chatbots.map((p, i) =>
												i === chatbotIndex
													? { ...p, persona: e.target.value }
													: p,
											),
										})
									}
								/>
							</div>
							<div className="flex gap-2 self-center items-center">
								<button
									type="button"
									onClick={() => setChatbotIndex(chatbotIndex - 1)}
									disabled={chatbotIndex === 0}
									className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
								>
									<CaretLeft size={24} />
								</button>
								<span className="text-sm">
									{chatbotIndex + 1} / {chatRoomInput.chatbots.length}
								</span>
								<button
									type="button"
									onClick={() => setChatbotIndex(chatbotIndex + 1)}
									disabled={chatbotIndex === chatRoomInput.chatbots.length - 1}
									className="p-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
								>
									<CaretRight size={24} />
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Options for user */}
				<div>
					{chatRoomInput.users.length > 0 && userView && (
						<div className="flex flex-col gap-2">
							<div className="flex flex-col gap-2">
								<label htmlFor={"name"}>Name:</label>
								<input
									type="text"
									id={"name"}
									className="p-2 border border-gray-300 rounded-md w-full max-w-2xl"
									placeholder="Enter name"
									value={chatRoomInput.users[userIndex]?.name || ""}
									onChange={(e) =>
										setChatRoomInput({
											...chatRoomInput,
											users: chatRoomInput.users.map((p, i) =>
												i === userIndex ? { ...p, name: e.target.value } : p,
											),
										})
									}
								/>
							</div>
							<div className="flex gap-2 self-center items-center">
								<button
									type="button"
									onClick={() => setUserIndex(userIndex - 1)}
									disabled={userIndex === 0}
									className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
								>
									<CaretLeft size={24} />
								</button>
								<span className="text-sm">
									{userIndex + 1} / {chatRoomInput.users.length}
								</span>
								<button
									type="button"
									onClick={() => setUserIndex(userIndex + 1)}
									disabled={userIndex === chatRoomInput.users.length - 1}
									className="p-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
								>
									<CaretRight size={24} />
								</button>
							</div>
						</div>
					)}
				</div>

				<button
					className="bg-blue-500 text-white p-2 rounded-md w-[10rem] self-center disabled:opacity-50"
					type="button"
					onClick={() => {
						handleCreateChatRoom(chatRoomInput);
					}}
					disabled={
						(chatbotNum === 0 && userNum === 0) ||
						chatRoomInput.title === "" ||
						chatRoomInput.chatbots.some(
							(chatbot) => chatbot.name === "" || chatbot.persona === "",
						) ||
						chatRoomInput.users.some((user) => user.name === "") ||
						disableSubmitButton
					}
				>
					Create
				</button>
			</div>
		</div>
	);
};
