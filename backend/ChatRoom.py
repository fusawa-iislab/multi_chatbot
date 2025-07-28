from ChatData import ChatData
from Person import Person


class ChatRoom:
    id = 1

    def __init__(
        self, title: str, persons: list | None = None, chatdatas: list | None = None
    ):
        self.id = ChatRoom.id
        ChatRoom.id += 1
        self.persons: list[Person] = persons or []
        self.chatdatas: list[ChatData] = chatdatas or []
        self.title = title

    def __repr__(self):
        return f"ChatRoom(id={self.id}, title={self.title}, persons={self.persons}, chatdatas={self.chatdatas})"

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "persons": [person.to_dict() for person in self.persons],
            "chatdatas": [chat.to_dict() for chat in self.chatdatas],
        }

    def to_frontend(self):
        return {
            "id": self.id,
            "title": self.title,
            "persons": [person.to_frontend() for person in self.persons],
            "chatDatas": [chat.to_frontend() for chat in self.chatdatas],
        }

    def add_person(
        self,
        name: str,
        persona: str,
        is_user: bool = False,
        chatroom_id: int | None = None,
    ):
        person = Person(
            name=name, persona=persona, chatroom_id=chatroom_id, is_user=is_user
        )
        self.persons.append(person)
        return

    def add_chatdata(self, name: int, content: str, chatroom_id: int | None = None):
        chatdata = ChatData(name=name, content=content, chatroom_id=chatroom_id)
        self.chatdatas.append(chatdata)
        return


def create_chatroom(title: str, persons_data: list) -> ChatRoom:
    chatroom = ChatRoom(title=title)
    for person_data in persons_data:
        chatroom.add_person(
            name=person_data["name"],
            persona=person_data["persona"],
            is_user=False,
            chatroom_id=chatroom.id,
        )
    return chatroom
