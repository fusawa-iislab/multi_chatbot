from ChatRoom import ChatRoom
from ChatData import ChatData
from Person import Person
from test_data import chatrooms_data

def chatlog_prompt(chatdatas: list[ChatData]) -> str:
    return "\n".join(f"[{chat.name}] {chat.content}" for chat in chatdatas)

def environment_prompt(chatroom: ChatRoom) -> str:
    person_names = ",".join([person.name for person in chatroom.persons])

    return (
        f"ここでは、{person_names}の{len(chatroom.persons)}人が会話をしています。\n"
        f"会話のタイトルは,{chatroom.title}です。\n"
    )
def personality_prompt(person: Person) -> str:
    return (
        f"あなたは、{person.persona}な{person.name}です。\n"
    )

# def developer_prompt(chatroom: ChatRoom, person: Person) -> str:
#     return (
#         f"{environment_prompt(chatroom)}"
#         f"{personality_prompt(chatroom, person)}"
#         f"あなたは{person.name}として、これまでの会話の流れに沿って応答してください。\n"
#     )sss

def user_prompt(chatroom: ChatRoom, person: Person) -> str:
    return (
        f"{environment_prompt(chatroom)}"
        f"これまでの会話の流れ: \n"
        f"{chatlog_prompt(chatroom.chatdatas)}\n"
        f"{personality_prompt(person)}"
        "これまでの会話の流れに沿って応答してください。\n"
        "※人の名前が書いてある[]は出さないでください\n"
    )

def create_prompt(chatroom: ChatRoom, person: Person):
    return [
        {
            "role": "user",
            "content": user_prompt(chatroom, person)
        }
    ]


if __name__ == "__main__":
    chatroom = chatrooms_data[1]
    person = chatroom.persons[0]
    print(create_prompt(chatroom, person))

