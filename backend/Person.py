class Person:
    id = 1
    def __init__(self, name: str, persona: str, chat_room_id: int | None = None, is_user: bool = False):
        self.id = Person.id
        Person.id += 1
        self.name = name
        self.persona = persona
        self.chat_room_id = chat_room_id
        self.is_user = is_user

    def __repr__(self):
        return f"Person(name={self.name}, persona={self.persona})"
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "persona": self.persona,
            "chat_room_id": self.chat_room_id,
            "is_user": self.is_user
        }
    
    def to_frontend(self):
        return {
            "id": self.id,
            "name": self.name,
            "persona": self.persona,
            "isUser": self.is_user
        }