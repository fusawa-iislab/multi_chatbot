import { type NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ chatRoomId: string }> },
) {
	const { personId, content } = await request.json();
	const { chatRoomId } = await params;

	if (typeof content !== "string" || content.trim() === "") {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
	if (typeof personId !== "number") {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
	const data = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatroom/${chatRoomId}/chat`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ personId, content }),
		},
	);
	if (!data.ok) {
		const errorData = await data
			.json()
			.catch(() => ({ error: "Failed to send message" }));
		return NextResponse.json(errorData, { status: data.status });
	}
	return NextResponse.json({ message: "success" });
}
