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
};

export const CreateChatRoom = () => {
	const router = useRouter();
	const [personNum, setPersonNum] = useState<number>(0);
	const [chatRoomInput, setChatRoomInput] = useState<ChatRoomInputType>({
		title: "",
		persons: [],
	});
	const [personIndex, setPersonIndex] = useState<number>(0);
	const [buttonPassive, setButtonState] = useState<boolean>(false);

	useEffect(() => {
		setChatRoomInput((prev) => ({
			title: prev.title,
			persons: Array.from({ length: personNum }, (_, index) => ({
				name: prev.persons[index]?.name || "",
				persona: prev.persons[index]?.persona || "",
			})),
		}));
	}, [personNum]);

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

	//Catches runtime error if user has deleted a person after entering data.
	const handleIndexError = (currentPersonIndex: number, dataType: string) => {
		try {
			if (dataType === "name") {
				return chatRoomInput.persons[personIndex].name;
			} else if (dataType === "persona") {
				return chatRoomInput.persons[personIndex].persona;
			}
		} catch (RunTimeError) {
			setPersonIndex(personIndex - 1);
			return "";
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
				<div className="flex flex-col gap-2">
					<div className="flex gap-4 items-center">
						<label htmlFor="persons">Persons:</label>
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
					{chatRoomInput.persons.length > 0 && (
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
						) || buttonPassive // Disable button if already creating a chat room.
					}
				>
					Create
				</button>
			</div>
		</div>
	);
};
