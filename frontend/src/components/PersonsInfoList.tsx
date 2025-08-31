import type { PersonType } from "../types";
import { PersonsInfoListItem } from "./PersonsInfoListItem";

type PersonInfoListProps = {
	persons: PersonType[];
	chatRoomId: number;
};

export const PersonInfoList: React.FC<PersonInfoListProps> = ({
	persons,
	chatRoomId, // Default to 0 if chatRoomId is not provided
}) => {
	return (
		<div className="grid grid-cols-3 gap-2">
			{persons.map((person) => (
				<PersonsInfoListItem
					key={person.id}
					person={person}
					chatRoomId={chatRoomId}
				/>
			))}
		</div>
	);
};
