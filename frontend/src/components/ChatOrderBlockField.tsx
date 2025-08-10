import { CHATORDER_LOOP_INDENT } from "../config/design";
import type { ChatOrderItem, PersonType } from "../types";

const Comment: React.FC<{
	persons: PersonType[];
	personId: number;
	id: number;
	handleChangeCommentPerson: (id: number, personId: number) => void;
}> = ({ persons, personId, id, handleChangeCommentPerson }) => {
	return (
		<div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md border border-blue-300 dark:border-blue-700 font-semibold text-gray-900 dark:text-white">
			<span className="mr-2">Comment:</span>
			<select
				value={personId}
				onChange={(e) => handleChangeCommentPerson(id, Number(e.target.value))}
				className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-1 text-center "
			>
				{persons.map((person) => (
					<option key={person.id} value={person.id}>
						{person.name}
					</option>
				))}
			</select>
		</div>
	);
};

const Loop: React.FC<{
	iteration: number;
	id: number;
	handleChangeLoopIteration: (
		e: React.ChangeEvent<HTMLInputElement>,
		id: number,
	) => void;
}> = ({ iteration, id, handleChangeLoopIteration }) => {
	return (
		<div className="bg-green-100 dark:bg-green-900 p-2 rounded-md border border-green-300 dark:border-green-700 max-w-xl">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center gap-2">
					<p className="font-semibold text-gray-900 dark:text-white">Loop</p>
					<input
						type="number"
						value={iteration}
						onChange={(e) => handleChangeLoopIteration(e, id)}
						className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-1 w-[3rem] text-center "
						min={1}
						max={9}
					/>
				</div>
			</div>
		</div>
	);
};

const ChatOrderItemRenderer: React.FC<{
	item: ChatOrderItem;
	persons: PersonType[];
	handleChangeLoopIteration: (
		e: React.ChangeEvent<HTMLInputElement>,
		id: number,
	) => void;
	handleChangeCommentPerson: (id: number, personId: number) => void;
}> = ({
	item,
	persons,
	handleChangeLoopIteration,
	handleChangeCommentPerson,
}) => {
	const leftOffset = CHATORDER_LOOP_INDENT * item.loopDepth;

	if (item.type === "comment") {
		return (
			<div
				className="flex flex-col gap-2 max-w-xl relative"
				style={{ left: `${leftOffset}rem` }}
			>
				<Comment
					persons={persons}
					personId={item.personId}
					id={item.id}
					handleChangeCommentPerson={handleChangeCommentPerson}
				/>
			</div>
		);
	}
	if (item.type === "loop") {
		return (
			<div
				className="flex flex-col gap-2 max-w-xl relative"
				style={{ left: `${leftOffset}rem` }}
			>
				<Loop
					iteration={item.iteration}
					id={item.id}
					handleChangeLoopIteration={handleChangeLoopIteration}
				/>
			</div>
		);
	}
	return null;
};

type ChatorderBlockFieldProps = {
	order: ChatOrderItem[];
	persons: PersonType[];
	setOrder: (order: ChatOrderItem[]) => void;
};

export const ChatOrderBlockField = ({
	order,
	persons,
	setOrder,
}: ChatorderBlockFieldProps) => {
	const handleChangeCommentPerson = (id: number, personId: number) => {
		setOrder(
			order.map((item) => (item.id === id ? { ...item, personId } : item)),
		);
	};

	const handleChangeLoopIteration = (
		e: React.ChangeEvent<HTMLInputElement>,
		id: number,
	) => {
		setOrder(
			order.map((item) =>
				item.id === id ? { ...item, iteration: Number(e.target.value) } : item,
			),
		);
	};

	return (
		<div className="flex flex-col gap-2 max-w-2xl">
			{order.map((item) => (
				<ChatOrderItemRenderer
					key={item.id}
					item={item}
					persons={persons}
					handleChangeLoopIteration={handleChangeLoopIteration}
					handleChangeCommentPerson={handleChangeCommentPerson}
				/>
			))}
		</div>
	);
};
