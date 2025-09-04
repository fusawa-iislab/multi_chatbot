import { type NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ chatRoomId: string }> },
) {
	const { chatRoomId } = await params;

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatroom/${chatRoomId}/copy`,
		{
			method: "POST",
		},
	);

	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ error: "Failed to copy chat room" }));
		return NextResponse.json(errorData, { status: response.status });
	}

	return NextResponse.json({ message: "Chat room copied successfully" });
}
