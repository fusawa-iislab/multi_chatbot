import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ chatRoomId: string }> },
) {
	const { chatRoomId } = await params;
	const { title } = await request.json();

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chatroom/${chatRoomId}/title`,
		{
			method: "PUT",
			body: JSON.stringify({ title }),
		},
	);

	if (!res.ok) {
		return NextResponse.json(
			{ message: "Failed to update title" },
			{ status: 500 },
		);
	}

	return NextResponse.json({ message: "Title updated" });
}
