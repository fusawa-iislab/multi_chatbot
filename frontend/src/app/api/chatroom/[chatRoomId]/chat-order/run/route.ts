import { type NextRequest, NextResponse } from "next/server";
import type { ChatDataType } from "../../../../../../types";

export async function POST(
	request: NextRequest,
	{ params }: { params: { chatRoomId: string } },
) {
	const { chatRoomId } = await params;
	const order = await request.json();

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatroom/${chatRoomId}/chat-order/run`,
		{
			method: "POST",
			body: JSON.stringify(order),
		},
	);

	if (!response.ok) {
		return NextResponse.json(
			{ error: "Failed to run chat order" },
			{ status: 500 },
		);
	}

	const data: ChatDataType[] = await response.json();
	return NextResponse.json(data);
}
