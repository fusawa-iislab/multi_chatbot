from __future__ import annotations
from ChatData import ChatData


class ChatOrder:
    def __init__(
        self, order: list[Comment | Loop] | None = None, chatroom_id: int | None = None
    ):
        if order is None:
            order = []
        self.order = order
        self.chatroom_id = chatroom_id

    def to_dict(self):
        return {
            "order": [item.to_dict() for item in self.order],
            "chatroom_id": self.chatroom_id,
        }

    def to_frontend(self):
        return {
            "order": [item.to_frontend() for item in self.order],
            "chatroomId": self.chatroom_id,
        }

    def generate_person_ids(self):
        person_ids = []
        current_loop_depth = 0

        def process(item):
            nonlocal current_loop_depth
            if item.type == "comment" and item.loop_depth == current_loop_depth:
                person_ids.append(item.person_id)
            elif item.type == "loop" and item.loop_depth == current_loop_depth:
                current_loop_depth += 1
                children = [child for child in self.order if child.parent_id == item.id]
                children.sort(key=lambda x: x.id)
                if children:
                    for _ in range(item.iteration):
                        for child in children:
                            process(child)
                current_loop_depth -= 1

        if self.order:
            for item in self.order:
                process(item)
        return person_ids


class Comment:
    type = "comment"

    def __init__(
        self, id: int, person_id: int, parent_id: int | None = None, loop_depth: int = 0
    ):
        self.id = id
        self.person_id = person_id
        self.parent_id = parent_id
        self.loop_depth = loop_depth

    def to_dict(self):
        return {
            "type": self.type,
            "id": self.id,
            "person_id": self.person_id,
            "parent_id": self.parent_id,
            "loop_depth": self.loop_depth,
        }

    def to_frontend(self):
        return {
            "type": self.type,
            "id": self.id,
            "personId": self.person_id,
            "parentId": self.parent_id,
            "loopDepth": self.loop_depth,
        }


class Loop:
    type = "loop"

    def __init__(
        self,
        id: int,
        parent_id: int | None = None,
        loop_depth: int = 0,
        iteration: int = 0,
    ):
        self.id = id
        self.parent_id = parent_id
        self.loop_depth = loop_depth
        self.iteration = iteration

    def to_dict(self):
        return {
            "type": self.type,
            "id": self.id,
            "parent_id": self.parent_id,
            "loop_depth": self.loop_depth,
            "iteration": self.iteration,
        }

    def to_frontend(self):
        return {
            "type": self.type,
            "id": self.id,
            "parentId": self.parent_id,
            "loopDepth": self.loop_depth,
            "iteration": self.iteration,
        }


def format_chatorder(input: list):
    order = []
    for item in input:
        if item["type"] == "comment":
            order.append(
                Comment(
                    item["id"], item["person_id"], item["parent_id"], item["loop_depth"]
                )
            )
        elif item["type"] == "loop":
            order.append(
                Loop(
                    item["id"], item["parent_id"], item["loop_depth"], item["iteration"]
                )
            )
        else:
            raise ValueError(f"Invalid order type: {item['type']}")
    return order


def create_chatorder(input: list, chatroom_id: int):
    order = format_chatorder(input)
    return ChatOrder(order, chatroom_id)

def create_chatorder_from_chatlog(chatdatas: list[ChatData], chatroom_id: int):
    order = []
    for i in range(len(chatdatas)):
        order.append(
            Comment(
                i + 1,
                chatdatas[i].person_id,
                None,
                0,
            )
        )
    return ChatOrder(order, chatroom_id)