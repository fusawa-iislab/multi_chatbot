class ChatData:
    id = 1

    def __init__(
        self, name: str, person_id: int, content: str, chatroom_id: int | None = None
    ):
        self.id = ChatData.id
        ChatData.id += 1
        self.name = name
        self.person_id = person_id
        self.content = content
        self.chatroom_id = chatroom_id

    def __repr__(self):
        return f"ChatData(id={self.id}, name={self.name}, person_id={self.person_id}, content={self.content})"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "person_id": self.person_id,
            "content": self.content,
            "chatroom_id": self.chatroom_id,
        }

    def to_frontend(self):
        return {
            "id": self.id,
            "name": self.name,
            "personId": self.person_id,
            "content": self.content,
        }
