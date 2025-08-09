export type ChatRoomType = {
	id: number;
	persons: PersonType[];
	chatDatas: ChatDataType[];
	title: string;
	chatOrder: ChatOrder | null;
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
	personId: number;
};

export type ChatOrderComment = {
	type: "comment";
	id: number;
	personId: number;
	parentId: number | null;
	loopDepth: number;
};

export type ChatOrderLoop = {
	type: "loop";
	id: number;
	parentId: number | null;
	loopDepth: number;
	iteration: number;
};

export type ChatOrderItem = ChatOrderComment | ChatOrderLoop;

export type ChatOrder = {
	order: ChatOrderItem[];
	chatroomId: number;
};
