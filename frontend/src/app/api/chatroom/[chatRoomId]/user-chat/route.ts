import { type NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	context: { params: { chatRoomId: string } },
) {
	const { personId, content } = await request.json();
	const { chatRoomId } = await context.params;

	if (typeof content !== "string" || content.trim() === "") {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
	if (typeof personId !== "number") {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
	const data = await fetch(
		`${process.env.BACKEND_API_URL}/api/chatroom/${chatRoomId}/user-chat`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ personId, content }),
		},
	);
	if (!data.ok) {
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 },
		);
	}
	return NextResponse.json({ message: "success" });
}
