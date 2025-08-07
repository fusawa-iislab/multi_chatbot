import os

from ChatRoom import create_chatroom
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from llm import get_response
from prompt import create_prompt
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
    # 将来的に構造化します
    prompt = create_prompt(chatroom, person)
    response_text = get_response(prompt, max_output_tokens=1000)
    chatroom.add_chatdata(
        name=person.name, content=response_text, chatroom_id=chatroom_id
    )
    return chatroom.chatdatas[-1].to_frontend()


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
    return {"message": "Chat log reset successfully"}


@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application!"}
