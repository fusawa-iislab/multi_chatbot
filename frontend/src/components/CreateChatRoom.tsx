"use client";
import { useRouter } from "next/navigation";
import { CaretLeft, CaretRight } from "phosphor-react";
import { useEffect, useState } from "react";

type ChatRoomInputType = {
	title: string;
	persons: {
		name: string;
		persona: string;
	}[];
	users: {
		name: string;
		// Could add more fields.
	}[];
};

export const CreateChatRoom = () => {
	const router = useRouter();
	const [personNum, setPersonNum] = useState<number>(0);
	const [userNum, setUserNum] = useState<number>(0);
	const [chatRoomInput, setChatRoomInput] = useState<ChatRoomInputType>({
		title: "",
		persons: [],
		users: [],
	});
	const [personIndex, setPersonIndex] = useState<number>(0);
	const [userIndex, setUserIndex] = useState<number>(0);
	const [buttonActive, setButtonState] = useState<boolean>(false);
	const [userView, setView] = useState<boolean>(false);

	useEffect(() => {
		setChatRoomInput((prev) => ({
			title: prev.title,
			persons: Array.from({ length: personNum }, (_, index) => ({
				name: prev.persons[index]?.name || "",
				persona: prev.persons[index]?.persona || "",
			})),
			users: Array.from({ length: userNum }, (_, index) => ({
				name: prev.users[index]?.name || "",
			})),
		}));
	}, [personNum + userNum]);

	const handleCreateChatRoom = async (chatRoomInput: ChatRoomInputType) => {
		const res = await fetch("/api/chatroom/create", {
			method: "POST",
			body: JSON.stringify(chatRoomInput),
		});
		if (res.ok) {
			const data = await res.json();
			console.log("Chat room created", data);
			const chatRoomId = data.chatRoomId;
			router.push(`/chatroom/${chatRoomId}`);
		} else {
			console.error("Failed to create chat room");
			setButtonState(false);
		}
	};

	//Catches runtime error if client has deleted a person/user after entering data.
	const handleIndexError = (currentIndex: number, dataType: string, user: boolean = false) => {
		if (user) {
			try {
				if (dataType === "name") {
					return chatRoomInput.users[currentIndex].name;
				}
			} catch (RunTimeError) {
				setUserIndex(userIndex - 1);
				return "";
			}
		} else {
			try {
				if (dataType === "name") {
					return chatRoomInput.persons[currentIndex].name;
				} else if (dataType === "persona") {
					return chatRoomInput.persons[currentIndex].persona;
				}
			} catch (RunTimeError) {
				setPersonIndex(personIndex - 1);
				return "";
			}
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
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ width: '60%' }}>
					<div className="flex gap-4 items-center">
						<button
							// Toggle to persons information view
							className={!userView ? "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" :
								"px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"}
							onClick={() => setView(false)}
							type="button"
						>
							Persons:
						</button>
						<input
							type="number"
							id="persons"
							className="p-2 border border-gray-300 rounded-md w-[5rem]"
							value={personNum}
							onChange={(e) => setPersonNum(Number(e.target.value))}
							min={1}
							max={10}
							required
						/>
					</div>
					{/* User mode button */}
					<div className="flex gap-4 items-center">
						<button
							// Toggle to persons information view
							className={userView ? "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" :
								"px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"}
							onClick={() => setView(true)}
							type="button"
						>
							Users:
						</button>
						<input
							type="number"
							id="users"
							className="p-2 border border-gray-300 rounded-md w-[5rem]"
							value={userNum}
							onChange={(e) => setUserNum(Number(e.target.value))}
							min={0}
							max={10}
						/>
					</div>
				</div>

				{/* Options for AI "persons" */}
				<div>
					{chatRoomInput.persons.length > 0 && !userView && (
						<div className="flex flex-col gap-2">
							<div className="flex flex-col gap-2">
								<label htmlFor={"name"}>Name:</label>
								<input
									type="text"
									id={"name"}
									className="p-2 border border-gray-300 rounded-md w-full max-w-2xl"
									placeholder="Enter name"
									value={handleIndexError(personIndex, "name")}
									onChange={(e) =>
										setChatRoomInput({
											...chatRoomInput,
											persons: chatRoomInput.persons.map((p, i) =>
												i === personIndex ? { ...p, name: e.target.value } : p,
											),
										})
									}
								/>
								<label htmlFor={"persona"}>Persona:</label>
								<textarea
									id={"persona"}
									className="p-2 border border-gray-300 rounded-md w-full h-24 resize-none"
									placeholder="Enter persona description"
									value={handleIndexError(personIndex, "persona")}
									onChange={(e) =>
										setChatRoomInput({
											...chatRoomInput,
											persons: chatRoomInput.persons.map((p, i) =>
												i === personIndex
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
									onClick={() => setPersonIndex(personIndex - 1)}
									disabled={personIndex === 0}
									className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
								>
									<CaretLeft size={24} />
								</button>
								<span className="text-sm">
									{personIndex + 1} / {chatRoomInput.persons.length}
								</span>
								<button
									type="button"
									onClick={() => setPersonIndex(personIndex + 1)}
									disabled={personIndex === chatRoomInput.persons.length - 1}
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
									value={handleIndexError(userIndex, "name", true)}
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
						setButtonState(true);
					}}
					disabled={
						chatRoomInput.title === "" ||
						chatRoomInput.persons.some(
							(person) => person.name === "" || person.persona === "",
						) || chatRoomInput.users.some(
							(user) => user.name === "")
						|| buttonActive // Disable button if already creating a chat room.
					}
				>
					Create
				</button>
			</div>
		</div>
	);
};
