import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: { params: { chatRoomId: string } }) {
    const { chatRoomId } = await context.params; 
    const data = await fetch(`${process.env.BACKEND_API_URL}/api/chatrooms/${chatRoomId}`);
    if (!data.ok) {
        return NextResponse.json({ error: "Failed to fetch chat room data" }, { status: 500 });
    }
    const chatRoom = await data.json();
    if (chatRoom) {
        return NextResponse.json({ chatRoom: chatRoom });
    } 
    return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
}
