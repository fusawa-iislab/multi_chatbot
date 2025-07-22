import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const body = await req.json();
	const res = await fetch(
		`${process.env.BACKEND_API_URL}/api/chatroom/create`,
		{
			method: "POST",
			body: JSON.stringify(body),
		},
	);
	if (res.ok) {
		const data = await res.json();
		return NextResponse.json({ chatRoomId: data.chatRoomId });
	}
	return NextResponse.json(
		{ message: "Failed to create chat room" },
		{ status: 500 },
	);
}
