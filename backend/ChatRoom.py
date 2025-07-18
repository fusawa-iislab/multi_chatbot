from Person import Person
from ChatData import ChatData

class ChatRoom:
    id = 1
    def __init__(self, title: str, persons: list | None = None, chat_datas: list | None = None):
        self.id = ChatRoom.id
        ChatRoom.id += 1
        self.persons: list[Person] = persons or []
        self.chat_datas: list[ChatData] = chat_datas or []
        self.title = title

    def __repr__(self):
        return f"ChatRoom(id={self.id}, title={self.title}, persons={self.persons}, chat_data={self.chat_data})"
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "persons": [person.to_dict() for person in self.persons],
            "chat_datas": [chat.to_dict() for chat in self.chat_datas]
        }
    
    def to_frontend(self):
        return {
            "id": self.id,
            "title": self.title,
            "persons": [person.to_frontend() for person in self.persons],
            "chatDatas": [chat.to_frontend() for chat in self.chat_datas]
        }
    
    def add_person(self, name: str, persona: str, is_user: bool = False, chat_room_id: int | None = None):
        person = Person(name=name, persona=persona, chat_room_id=chat_room_id, is_user=is_user)
        self.persons.append(person)
        return
    
    def add_chat_data(self, name: int, content: str, chat_room_id: int | None = None):
        chat_data = ChatData(name=name, content=content, chat_room_id=chat_room_id)
        self.chat_datas.append(chat_data)
        return
    
    
    
