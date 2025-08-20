import asyncio
import os

from ChatRoom import create_chatroom
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from test_data import chatrooms_data

load_dotenv()

app = FastAPI()

frontend_api_url = os.getenv("FRONTEND_API_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_api_url] if frontend_api_url else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/chatrooms")
async def get_chatrooms():
    return [room.to_frontend() for room in chatrooms_data]


@app.post("/api/chatroom/create")
async def create_new_chatroom(request: Request):
    data = await request.json()
    print(f"Received data: {data}")
    title = data.get("title")
    persons = data.get("persons")
    for person in persons:
        person["is_user"] = person.pop("isUser")
    chatroom = create_chatroom(title=title, persons_data=persons)
    chatrooms_data.append(chatroom)
    return {"chatRoomId": chatroom.id}


@app.get("/api/chatroom/{chatroom_id}")
async def get_chatroom(chatroom_id: int):
    print(f"chatroom_id: {chatroom_id}")
    chatroom = next((room for room in chatrooms_data if room.id == chatroom_id), None)
    if chatroom:
        print(chatroom.to_frontend())
        return chatroom.to_frontend()
    return {"error": "Chat room not found"}, 404


@app.delete("/api/chatroom/{chatroom_id}")
async def delete_chatroom(chatroom_id: int):
    global chatrooms_data
    chatroom = next((room for room in chatrooms_data if room.id == chatroom_id), None)
    if not chatroom:
        return {"error": "チャットルームが見つかりません"}, 404
    chatrooms_data = [room for room in chatrooms_data if room.id != chatroom_id]
    return {"message": "チャットルームが正常に削除されました"}


@app.post("/api/chatroom/{chatroom_id}/edit-person")
async def edit_person(request: Request):
    data = await request.json()
    print(f"Received data: {data}")
    person_id = data.get("personId")
    chatroom_id = data.get("chatRoomId")
    new_name = data.get("name")
    new_persona = data.get("persona")
    chatroom = next((room for room in chatrooms_data if room.id == chatroom_id), None)
    if not chatroom:
        return {"error": "Chat room not found"}, 404
    person = next(
        (person for person in chatroom.persons if person.id == person_id), None
    )
    if not person:
        return {"error": "Person not found"}, 404
    person.name = new_name
    person.persona = new_persona
    return {
        "message": "Person name updated successfully",
        "personId": person_id,
        "newName": new_name,
        "newPersona": new_persona,
    }


@app.post("/api/chatroom/{chatroom_id}/chat-reply")
async def chat_reply(chatroom_id: int, request: Request):
    data = await request.json()
    print(f"Received data: {data}")
    person_id = data.get("personId")
    chatroom = next((room for room in chatrooms_data if room.id == chatroom_id), None)
    if not chatroom:
        print(f"Chat room {chatroom_id} not found")
        return {"error": "Chat room not found"}, 404
    person = next((p for p in chatroom.persons if p.id == person_id), None)
    if not person:
        print(f"Person with ID {person_id} not found in chat room {chatroom_id}")
        return {"error": "Person not found"}, 404
    if person.is_user:
        print(f"User {person.name} cannot be a chatbot in chat room {chatroom_id}")
        return {"error": "User cannot be a chatbot"}, 400
    chatdata_id = chatroom.next_response(person_id)
    return next(
        (chatdata for chatdata in chatroom.chatdatas if chatdata.id == chatdata_id),
        None,
    ).to_frontend()


@app.post("/api/chatroom/{chatroom_id}/user-chat")
async def user_input(chatroom_id: int, request: Request):
    data = await request.json()
    person_id = data.get("personId")
    content = data.get("content")

    chatroom = next((room for room in chatrooms_data if room.id == chatroom_id), None)
    if not chatroom:
        return {"error": "Chat room not found"}, 404

    person = next((p for p in chatroom.persons if p.id == person_id), None)
    if not person or not person.is_user:
        return {"error": "Invalid user"}, 400

    chatroom.add_chatdata(name=person.name, content=content, chatroom_id=chatroom_id)
    return {"message": "Message sent successfully"}


@app.post("/api/chatroom/{chatroom_id}/reset-chatlog")
async def reset_chatlog(chatroom_id: int):
    chatroom = next((room for room in chatrooms_data if room.id == chatroom_id), None)
    if not chatroom:
        return {"error": "Chat room not found"}, 404
    chatroom.chatdatas = []
    return {"message": "Chatlog reset successfully"}


@app.websocket("/api/chatroom/{chatroom_id}/chat-order/run")
async def run_chat_order(websocket: WebSocket, chatroom_id: int):
    try:
        await websocket.accept()
        data = await websocket.receive_json()
        chatroom = next(
            (room for room in chatrooms_data if room.id == chatroom_id), None
        )
        if not chatroom:
            await websocket.send_json({"error": "Chat room not found", "type": "error"})
            return
        for item in data:
            item["loop_depth"] = item.pop("loopDepth")
            item["parent_id"] = item.pop("parentId")
            if item.get("personId"):
                item["person_id"] = item.pop("personId")
        chatroom.add_chatorder(data)
        person_ids = chatroom.chatorder.generate_person_ids()
        for person_id in person_ids:
            person = next((p for p in chatroom.persons if p.id == person_id), None)
            print(f"person: {person}")
            if not person:
                await websocket.send_json(
                    {"error": "Person not found", "type": "error"}
                )
            elif person.is_user:
                await websocket.send_json(
                    {
                        "type": "input-request",
                        "content": f"{person.name}'s input is required",
                    }
                )
                user_input = await websocket.receive_json()
                chatdata_id = chatroom.add_chatdata(
                    name=person.name,
                    person_id=person_id,
                    content=user_input["content"],
                    chatroom_id=chatroom_id,
                )
                await websocket.send_json(
                    {
                        "type": "chat-response",
                        "content": next(
                            (c for c in chatroom.chatdatas if c.id == chatdata_id),
                            None,
                        ).to_frontend(),
                    }
                )
            else:
                await websocket.send_json(
                    {
                        "type": "message",
                        "content": f"generating... {person.name}'s response...",
                    }
                )
                # Yield to the event loop so the previous message flushes to the client
                await asyncio.sleep(0)
                # Execute blocking LLM call off the event loop
                chatdata_id = await asyncio.to_thread(chatroom.next_response, person_id)
                chatdata = next(
                    (c for c in chatroom.chatdatas if c.id == chatdata_id), None
                )
                if chatdata:
                    await websocket.send_json(
                        {"type": "chat-response", "content": chatdata.to_frontend()}
                    )
                else:
                    await websocket.send_json(
                        {"type": "error", "content": "Chatdata not found"}
                    )
        await websocket.send_json(
            {"type": "end", "content": "Chat order run successfully"}
        )
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for chatroom {chatroom_id}")


@app.post("/api/chatroom/{chatroom_id}/chat-order")
async def save_chat_order(chatroom_id: int, request: Request):
    data = await request.json()
    chatroom = next((room for room in chatrooms_data if room.id == chatroom_id), None)
    if not chatroom:
        return {"error": "Chat room not found"}, 404
    for item in data:
        item["loop_depth"] = item.pop("loopDepth")
        item["parent_id"] = item.pop("parentId")
        if item.get("personId"):
            item["person_id"] = item.pop("personId")
    chatroom.add_chatorder(data)
    return {"message": "Chat order saved successfully"}


@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application!"}
