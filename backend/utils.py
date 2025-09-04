from ChatRoom import ChatRoom


def generate_unique_title(original_title: str, chatrooms: list[ChatRoom]) -> str:
    index = 2
    if original_title not in [chatroom.title for chatroom in chatrooms]:
        return original_title
    while True:
        if f"{original_title} {index}" not in [
            chatroom.title for chatroom in chatrooms
        ]:
            return f"{original_title} {index}"
        index += 1
