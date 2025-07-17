import { NextRequest, NextResponse } from "next/server";
import { ChatDataType } from "../../../../../types";

export async function POST(request: NextRequest, context: { params: { chatRoomId: string } }) {
    const { personId } = await request.json();
    const { chatRoomId } = await context.params;
    if (typeof personId !== 'number') {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const data = await fetch(`${process.env.BACKEND_API_URL}/api/chatrooms/${chatRoomId}/chat-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId }),
    });
    if (!data.ok) {
        return NextResponse.json({ error: "Failed to get reply" }, { status: 500 });
    }
    const response: ChatDataType = await data.json();
    if (!response || !response.content) {
        return NextResponse.json({ error: "No reply content found" }, { status: 404 });
    }
    return NextResponse.json({ response: response });
}