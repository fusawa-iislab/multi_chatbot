class ChatOrder:
    def __init__(self, input: list | None = None, chatroom_id: int | None = None):
        if input is None:
            input = []
        self.order = create_chat_order(input)
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


def create_chat_order(input: list):
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
