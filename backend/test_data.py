from ChatRoom import ChatData, ChatRoom, Person

alice = Person("Alice", "A kind person who tries to help others", chatroom_id=1)
bob = Person("Bob", "A curious and adventurous person", chatroom_id=1)
charlie = Person("Charlie", "A thoughtful and wise person", chatroom_id=1)
you = Person(
    "User", "A user who interacts with the chatbot", is_user=True, chatroom_id=1
)

general_room = ChatRoom(
    title="General Chat Room", persons=[alice, bob, charlie, you], chatdatas=[]
)

eve = Person("Eve", "A mysterious and attractive person", chatroom_id=2)

chat_eve_1 = ChatData(name=eve.name, content="I have a secret.", chatroom_id=2)
chat_you_1 = ChatData(name=you.name, content="Tell me.", chatroom_id=2)
room_a = ChatRoom(title="a", persons=[eve, you], chatdatas=[chat_eve_1, chat_you_1])

# ChatRoom 3: "b" with Dave
dave = Person("Dave", "A cheerful and optimistic person", chatroom_id=3)

chat_dave_1 = ChatData(
    name=dave.name, content="It's nice weather today, isn't it?", chatroom_id=3
)
chat_you_2 = ChatData(name=you.name, content="It really is!", chatroom_id=3)
room_b = ChatRoom(title="b", persons=[dave, you], chatdatas=[chat_dave_1, chat_you_2])

chatrooms_data = [general_room, room_a, room_b]
