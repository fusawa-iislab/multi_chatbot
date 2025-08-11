import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ chatRoomId: string }> },
) {
	const { chatRoomId } = await params;
	const data = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatroom/${chatRoomId}`,
	);
	if (!data.ok) {
		return NextResponse.json(
			{ error: "Failed to fetch chat room data" },
			{ status: 500 },
		);
	}
	const chatRoom = await data.json();
	if (chatRoom) {
		return NextResponse.json({ chatRoom: chatRoom });
	}
	return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ chatRoomId: string }> },
) {
	const { chatRoomId } = await params;
	const data = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatroom/${chatRoomId}`,
		{ method: "DELETE" },
	);
	if (!data.ok) {
		return NextResponse.json(
			{ error: "Failed to delete chat room" },
			{ status: 500 },
		);
	}
	return NextResponse.json({ message: "Chat room deleted successfully" });
}
