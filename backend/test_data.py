from ChatRoom import Person, ChatData, ChatRoom

alice = Person("Alice", "親切で助けになろうとする人", chat_room_id=1)
bob = Person("Bob", "好奇心旺盛で冒険好きな人", chat_room_id=1)
charlie = Person("Charlie", "思慮深く賢い人", chat_room_id=1)
you = Person("Yugo", "チャットボットと対話するユーザー", is_user=True, chat_room_id=1)

general_room = ChatRoom(
    title="General Chat Room",
    persons=[alice, bob, charlie, you],
    chat_datas=[]
)

eve = Person("Eve", "謎めいていて魅力的な人", chat_room_id=2)

chat_eve_1 = ChatData(name=eve.name, content="秘密があるの。", chat_room_id=2)
chat_you_1 = ChatData(name=you.name, content="聞かせて。", chat_room_id=2)
room_a = ChatRoom(
    title="a",
    persons=[eve, you],
    chat_datas=[chat_eve_1, chat_you_1]
)

# ChatRoom 3: "b" with Dave
dave = Person("Dave", "陽気で楽観的な人", chat_room_id=3)

chat_dave_1 = ChatData(name=dave.name, content="今日はいい天気だね？", chat_room_id=3)
chat_you_2 = ChatData(name=you.name, content="本当にそうだね！", chat_room_id=3)
room_b = ChatRoom(
    title="b",
    persons=[dave, you],
    chat_datas=[chat_dave_1, chat_you_2]
)

chat_rooms_data = [general_room, room_a, room_b]

