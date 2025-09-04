import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ chatRoomId: string }> },
) {
	const { chatRoomId } = await params;
	const data = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatroom/${chatRoomId}`,
	);

	// バックエンドのエラーステータスを適切に伝播
	if (!data.ok) {
		const errorData = await data
			.json()
			.catch(() => ({ error: "Unknown error" }));
		return NextResponse.json(errorData, { status: data.status });
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
		const errorData = await data
			.json()
			.catch(() => ({ error: "Unknown error" }));
		return NextResponse.json(errorData, { status: data.status });
	}
	return NextResponse.json({ message: "Chat room deleted successfully" });
}

export async function POST(
	req: NextRequest,
	{
		params,
	}: {
		params: Promise<{
			name: string;
			persona: string;
			chatRoomId: number;
			personId: number;
		}>;
	},
) {
	const { name } = await params;
	const { persona } = await params;
	const { chatRoomId } = await params;
	const { personId } = await params;
	const body = await req.json();
	const res = await fetch(
		`${process.env.BACKEND_API_URL}/api/chatroom/${chatRoomId}/edit-person`,
		{
			method: "POST",
			body: JSON.stringify(body),
		},
	);
	if (res.ok) {
		// const data = await res.json();
		return NextResponse.json({
			name: name,
			persona: persona,
			chatroomId: chatRoomId,
			personId: personId,
		});
	}
	return NextResponse.json(
		{ message: "Failed to send person data" },
		{ status: 500 },
	);
}
