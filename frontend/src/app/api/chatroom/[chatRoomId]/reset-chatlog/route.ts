import { type NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ chatRoomId: string }> },
) {
	const { chatRoomId } = await params;

	const res = await fetch(
		`${process.env.BACKEND_API_URL}/api/chatroom/${chatRoomId}/reset-chatlog`,
		{
			method: "POST",
		},
	);
	if (!res.ok) {
		console.error(res);
		return NextResponse.json(
			{ error: "Failed to reset chat log" },
			{ status: 500 },
		);
	}
	return NextResponse.json(
		{ message: "Chat log reset successfully" },
		{ status: 200 },
	);
}
