from ChatRoom import Person, ChatData, ChatRoom

alice = Person("Alice", "親切で助けになろうとする人", chatroom_id=1)
bob = Person("Bob", "好奇心旺盛で冒険好きな人", chatroom_id=1)
charlie = Person("Charlie", "思慮深く賢い人", chatroom_id=1)
you = Person("Yugo", "チャットボットと対話するユーザー", is_user=True, chatroom_id=1)

general_room = ChatRoom(
    title="General Chat Room",
    persons=[alice, bob, charlie, you],
    chatdatas=[]
)

eve = Person("Eve", "謎めいていて魅力的な人", chatroom_id=2)

chat_eve_1 = ChatData(name=eve.name, content="秘密があるの。", chatroom_id=2)
chat_you_1 = ChatData(name=you.name, content="聞かせて。", chatroom_id=2)
room_a = ChatRoom(
    title="a",
    persons=[eve, you],
    chatdatas=[chat_eve_1, chat_you_1]
)

# ChatRoom 3: "b" with Dave
dave = Person("Dave", "陽気で楽観的な人", chatroom_id=3)

chat_dave_1 = ChatData(name=dave.name, content="今日はいい天気だね？", chatroom_id=3)
chat_you_2 = ChatData(name=you.name, content="本当にそうだね！", chatroom_id=3)
room_b = ChatRoom(
    title="b",
    persons=[dave, you],
    chatdatas=[chat_dave_1, chat_you_2]
)

chatrooms_data = [general_room, room_a, room_b]

