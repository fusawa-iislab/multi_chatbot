import type { PersonType } from "../types";
import { PersonsInfoListItem } from "./PersonsInfoListItem";

type PersonInfoListProps = {
	persons: PersonType[];
	chatRoomId: number;
	textareaPersonId: number | null;
	setTextareaPersonId: (id: number | null) => void;
};

export const PersonInfoList: React.FC<PersonInfoListProps> = ({
	persons,
	chatRoomId,
	textareaPersonId,
	setTextareaPersonId,
}) => {
	return (
		<div className="grid grid-cols-3 gap-2">
			{persons.map((person) => (
				<PersonsInfoListItem
					key={person.id}
					person={person}
					chatRoomId={chatRoomId}
					textareaPersonId={textareaPersonId}
					setTextareaPersonId={setTextareaPersonId}
				/>
			))}
		</div>
	);
};
