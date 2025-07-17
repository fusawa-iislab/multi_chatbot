from ChatRoom import Person, ChatData, ChatRoom

alice = Person("Alice", "A friendly and helpful person.", chat_room_id=1)
bob = Person("Bob", "A curious and adventurous person.", chat_room_id=1 )
charlie = Person("Charlie", "A wise and thoughtful person.", chat_room_id=1)
you = Person("You", "A user who interacts with the chatbot.", is_user=True, chat_room_id=1)

general_room = ChatRoom(
    title="General Chat Room",
    persons=[alice, bob, charlie, you],
    chat_datas=[]
)

eve = Person("Eve", "A mysterious and intriguing person.", chat_room_id=2)
chat_eve_1 = ChatData(name=eve.id, content="Eve: I have a secret to share.", chat_room_id=2)
chat_you_1 = ChatData(name=you.id, content="You: I'm listening.", chat_room_id=2)
room_a = ChatRoom(
    title="a",
    persons=[eve, you],
    chat_datas=[chat_eve_1, chat_you_1]
)

# ChatRoom 3: "b" with Dave
dave = Person("Dave", "A cheerful and optimistic person.", chat_room_id=3)
chat_dave_1 = ChatData(name=dave.id, content="Dave: It's a beautiful day, isn't it?", chat_room_id=3)
chat_you_2 = ChatData(name=you.id, content="You: Absolutely!", chat_room_id=3)
room_b = ChatRoom(
    title="b",
    persons=[dave, you],
    chat_datas=[chat_dave_1, chat_you_2]
)

chat_rooms_data = [general_room, room_a, room_b]

for room in chat_rooms_data:
    print(room.to_frontend())

