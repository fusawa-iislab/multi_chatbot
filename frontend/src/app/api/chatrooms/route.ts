import { NextResponse } from "next/server";
import type { ChatRoomType } from "../../../types";

export async function GET() {
	const data = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatrooms`,
	);
	if (!data.ok) {
		throw new Error("Network response was not ok");
	}
	const chatRooms: ChatRoomType[] = await data.json();

	return NextResponse.json({ chatRooms: chatRooms });
}
