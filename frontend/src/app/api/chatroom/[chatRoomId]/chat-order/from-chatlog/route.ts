import { type NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ chatRoomId: string }> },
) {
	const { chatRoomId } = await params;

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatroom/${chatRoomId}/chat-order/from-chatlog`,
		{
			method: "POST",
		},
	);

	if (!res.ok) {
		return NextResponse.json(
			{ message: "Failed to save order" },
			{ status: 500 },
		);
	}

	return NextResponse.json({ message: "Order saved successfully" });
}
