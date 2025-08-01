from ChatData import ChatData
from ChatRoom import ChatRoom
from Person import Person
from test_data import chatrooms_data


def chatlog_prompt(chatdatas: list[ChatData]) -> str:
    return "\n".join(f"[{chat.name}] {chat.content}" for chat in chatdatas)


def environment_prompt(chatroom: ChatRoom) -> str:
    person_names = ",".join([person.name for person in chatroom.persons])

    if len(chatroom.persons) == 0:
        return (
            f"Here, {person_names} a total of {len(chatroom.persons)} people are going to have a conversation.\n"
            f"You are going to start this conversation. The chatroom title is: {chatroom.title}\n"
            f'Additionally, don\'t respond to this prompt—that includes phrases like "sure", "of course", or "got it."\n'
            f"Start off with a pleasant introduction.\n"
        )
    else:
        return (
            f"Here, {person_names} ({len(chatroom.persons)} people) are having a conversation.\n"
            f"The conversation titled is: {chatroom.title}\n"
            f'Additionally, don\'t respond to this prompt—that includes phrases like "sure" or "got it."\n'
        )


def personality_prompt(person: Person) -> str:
    return f"You are {person.name}, who is {person.persona}.\n"


# def developer_prompt(chatroom: ChatRoom, person: Person) -> str:
#     return (
#         f"{environment_prompt(chatroom)}"
#         f"{personality_prompt(chatroom, person)}"
#         f"Please respond as {person.name} following the conversation flow so far.\n"
#     )sss


def user_prompt(chatroom: ChatRoom, person: Person) -> str:
    return (
        f"{environment_prompt(chatroom)}"
        f"Conversation history: \n"
        f"{chatlog_prompt(chatroom.chatdatas)}\n"
        f"{personality_prompt(person)}"
        "Please respond following the conversation flow so far.\n"
        "※Do not include the person's name in brackets []\n"
    )


def create_prompt(chatroom: ChatRoom, person: Person):
    return [{"role": "user", "content": user_prompt(chatroom, person)}]


if __name__ == "__main__":
    chatroom = chatrooms_data[1]
    person = chatroom.persons[0]
    print(create_prompt(chatroom, person))
