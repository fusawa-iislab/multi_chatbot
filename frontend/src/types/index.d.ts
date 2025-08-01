export type ChatRoomType = {
	id: number;
	persons: PersonType[];
	chatDatas: ChatDataType[];
	title: string;
};

export type PersonType = {
	name: string;
	persona: string;
	isUser: boolean;
	id: number;
};

export type ChatDataType = {
	id: number;
	name: string;
	content: string;
};
