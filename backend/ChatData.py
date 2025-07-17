class ChatData:
    id = 1
    def __init__(self, name: int, content: str, chat_room_id: int | None = None):
        self.id = ChatData.id
        ChatData.id += 1
        self.name = name
        self.content = content
        self.chat_room_id = chat_room_id

    def __repr__(self):
        return f"ChatData(person_id={self.person_id}, content={self.content})"
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "content": self.content,
            "chat_room_id": self.chat_room_id
        }
    
    def to_frontend(self):
        return {
            "id": self.id,
            "name": self.name,
            "content": self.content,
        }
    