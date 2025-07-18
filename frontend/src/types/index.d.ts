export type ChatRoomType = {
	id: number;
	persons: Person[];
	chatDatas: ChatData[];
	title: string;
};

export type PersonType = {
	name: string;
	persona: string;
	isUser: boolean;
	id: number;
};

export type ChatbotInput = Omit<PersonType, "isuser" | "id">;

export type ChatDataType = {
	id: number;
	name: string;
	content: string;
};
