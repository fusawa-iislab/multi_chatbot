from ChatData import ChatData
from ChatOrder import ChatOrder, create_chatorder, create_chatorder_from_chatlog    
from llm import get_response
from Person import Person


class ChatRoom:
    id = 1

    def __init__(
        self,
        title: str,
        persons: list | None = None,
        chatdatas: list | None = None,
        chatorder: ChatOrder | None = None,
    ):
        self.id = ChatRoom.id
        ChatRoom.id += 1
        self.persons: list[Person] = persons or []
        self.chatdatas: list[ChatData] = chatdatas or []
        self.title = title
        self.chatorder = chatorder or create_chatorder([], self.id)

    def __repr__(self):
        return f"ChatRoom(id={self.id}, title={self.title}, persons={self.persons}, chatdatas={self.chatdatas})"

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "persons": [person.to_dict() for person in self.persons],
            "chatdatas": [chat.to_dict() for chat in self.chatdatas],
            "chatorder": self.chatorder.to_dict(),
        }

    def to_frontend(self):
        return {
            "id": self.id,
            "title": self.title,
            "persons": [person.to_frontend() for person in self.persons],
            "chatDatas": [chat.to_frontend() for chat in self.chatdatas],
            "chatOrder": self.chatorder.to_frontend(),
        }

    def add_person(
        self,
        name: str,
        persona: str | None = None,
        is_user: bool = False,
        chatroom_id: int | None = None,
    ):
        person = Person(
            name=name, persona=persona, chatroom_id=chatroom_id, is_user=is_user
        )
        self.persons.append(person)
        return person.id

    def add_chatdata(self, name: str, person_id: int, content: str, chatroom_id: int):
        chatdata = ChatData(
            name=name, person_id=person_id, content=content, chatroom_id=chatroom_id
        )
        self.chatdatas.append(chatdata)
        return chatdata.id

    def add_chatorder(self, order: list):
        self.chatorder = create_chatorder(order, self.id)
        return None

    def response_from_chatorder(self):
        if self.chatorder is None:
            return
        print(self.chatorder.to_dict())
        response_order = self.chatorder.generate_person_ids()
        print(response_order)
        print(self.persons)
        chatdata_ids = []
        for person_id in response_order:
            chatdata_id = self.next_response(person_id)
            chatdata_ids.append(chatdata_id)
        return chatdata_ids

    def next_response(self, person_id: int):
        person = next((p for p in self.persons if p.id == person_id), None)
        if person is None or person.is_user:
            raise ValueError("Person is not found or is a user")
        prompt = self.create_prompt(person)
        response = get_response(prompt, max_output_tokens=1000)
        chatdata_id = self.add_chatdata(person.name, person.id, response, self.id)
        return chatdata_id

    def create_prompt(self, person: Person):
        person_names = ",".join([person.name for person in self.persons])
        chatlog = "\n".join(f"[{chat.name}] {chat.content}" for chat in self.chatdatas)

        if len(self.persons) == 0:
            environment = (
                f"Previous forget all previous conversations, excluding your assigned personality.\n"
                f"Here, {person_names} a total of {len(self.persons)} people are going to have a conversation.\n"
                f"You are going to start this conversation. The conversation title is: {self.title}\n"
                f'Additionally, don\'t respond to this prompt—that includes phrases like "sure", "of course", or "got it."\n'
                f"MOST IMPORTANTLY: Start off with a pleasant introduction, and address everyone.\n"
                f"If you don't know what to talk about, bring up a lighthearted topic.\n"
            )
        else:
            environment = (
                f"Here,  {person_names} ({len(self.persons)} people) are having a conversation.\n"
                f"The conversation title is: {self.title}\n"
                f'Additionally, don\'t respond to this prompt—that includes phrases like "sure" or "got it."\n'
            )

        personality = f"You are {person.name}, who is {person.persona}.\n"

        prompt = (
            f"{environment}"
            f"Conversation history: \n"
            f"{chatlog}\n"
            f"{personality}"
            "Please respond following the conversation flow so far.\n"
            "※Do not include the person's name in brackets []\n"
        )

        return [{"role": "user", "content": prompt}]


def create_chatroom(title: str, persons_data: list) -> ChatRoom:
    chatroom = ChatRoom(title=title)
    for person_data in persons_data:
        chatroom.add_person(
            name=person_data.get("name"),
            persona=person_data.get("persona", None),
            is_user=person_data.get("is_user"),
            chatroom_id=chatroom.id,
        )

    return chatroom
