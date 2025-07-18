from ChatRoom import ChatRoom
from ChatData import ChatData
from Person import Person
from test_data import chat_rooms_data

def chatlog_prompt(chat_datas: list[ChatData]) -> str:
    return "\n".join(f"[{chat.name}] {chat.content}" for chat in chat_datas)

def environment_prompt(chat_room: ChatRoom) -> str:
    person_names = ",".join([person.name for person in chat_room.persons])

    return (
        f"ここでは、{person_names}の{len(chat_room.persons)}人が会話をしています。\n"
        f"会話のタイトルは,{chat_room.title}です。\n"
    )
def personality_prompt(person: Person) -> str:
    return (
        f"あなたは、{person.persona}な{person.name}です。\n"
    )

# def developer_prompt(chat_room: ChatRoom, person: Person) -> str:
#     return (
#         f"{environment_prompt(chat_room)}"
#         f"{personality_prompt(chat_room, person)}"
#         f"あなたは{person.name}として、これまでの会話の流れに沿って応答してください。\n"
#     )

def user_prompt(chat_room: ChatRoom, person: Person) -> str:
    return (
        f"{environment_prompt(chat_room)}"
        f"これまでの会話の流れ: \n"
        f"{chatlog_prompt(chat_room.chat_datas)}\n"
        f"{personality_prompt(person)}"
        "これまでの会話の流れに沿って応答してください。\n"
        "※人の名前が書いてある[]は出さないでください\n"
    )

def create_prompt(chat_room: ChatRoom, person: Person):
    return [
        {
            "role": "user",
            "content": user_prompt(chat_room, person)
        }
    ]


if __name__ == "__main__":
    chat_room = chat_rooms_data[1]
    person = chat_room.persons[0]
    print(create_prompt(chat_room, person))

