class Person:
    id = 1

    def __init__(
        self,
        name: str,
        persona: str | None = None,
        chatroom_id: int | None = None,
        is_user: bool = False,
    ):
        self.id = Person.id
        Person.id += 1
        self.name = name
        self.persona = persona
        self.chatroom_id = chatroom_id
        self.is_user = is_user
        if persona is None and not is_user:
            raise ValueError("Persona is required for chatbots")

    def __repr__(self):
        return f"Person(name={self.name}, persona={self.persona})"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "persona": self.persona,
            "chatroom_id": self.chatroom_id,
            "is_user": self.is_user,
        }

    def to_frontend(self):
        return {
            "id": self.id,
            "name": self.name,
            "persona": self.persona,
            "isUser": self.is_user,
        }
