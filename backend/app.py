from fastapi import FastAPI, Request
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from llm import get_response
from prompt import create_prompt

from test_data import chat_rooms_data

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
async def get_chat_rooms():
    return [room.to_frontend() for room in chat_rooms_data]

@app.get("/api/chatroom/{chat_room_id}")
async def get_chat_room(chat_room_id: int):
    chat_room = next((room for room in chat_rooms_data if room.id == chat_room_id), None)
    if chat_room:
        return chat_room.to_frontend()
    return {"error": "Chat room not found"}, 404

@app.post("/api/chatroom/{chat_room_id}/chat-reply")
async def chat_reply(chat_room_id: int, request: Request):
    data = await request.json()
    print(f"Received data: {data}")
    person_id = data.get("personId")
    chat_room = next((room for room in chat_rooms_data if room.id == chat_room_id), None)
    if not chat_room:
        print(f"Chat room {chat_room_id} not found")
        return {"error": "Chat room not found"}, 404 
    person = next((p for p in chat_room.persons if p.id == person_id), None)
    if not person:
        print(f"Person with ID {person_id} not found in chat room {chat_room_id}")
        return {"error": "Person not found"}, 404
    if person.is_user:
        print(f"User {person.name} cannot be a chatbot in chat room {chat_room_id}")
        return {"error": "User cannot be a chatbot"}, 400
    
    # 将来的に構造化します
    prompt = create_prompt(chat_room, person)
    response_text = get_response(prompt, max_output_tokens=1000)
    chat_room.add_chat_data(name=person.name, content=response_text, chat_room_id=chat_room_id)
    return chat_room.chat_datas[-1].to_frontend()

@app.post("/api/chatroom/{chat_room_id}/user-chat")
async def user_input(chat_room_id: int, request: Request):
    data = await request.json()
    person_id = data.get("personId")
    content = data.get("content")

    chat_room = next((room for room in chat_rooms_data if room.id == chat_room_id), None)
    if not chat_room:
        return {"error": "Chat room not found"}, 404

    person = next((p for p in chat_room.persons if p.id == person_id), None)
    if not person or not person.is_user:
        return {"error": "Invalid user"}, 400

    chat_room.add_chat_data(name=person.name, content=content, chat_room_id=chat_room_id)
    return {"message": "Message sent successfully"}


@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI application!"}
