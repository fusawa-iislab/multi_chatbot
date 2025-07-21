"use client";
import { useState } from "react";
import { ChatRoomType, PersonType, ChatDataType } from "../types";


export const CreateChatRoom = () => {

    const [personNum, setPersonNum] = useState<number>(0);

    return (
        <div className="p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Create Chat Room</h1>
            <div className="flex flex-col gap-6 w-full max-w-2xl">
                <div className="flex flex-col gap-2">
                    <label htmlFor="title">Title:</label>
                    <input 
                        type="text" 
                        id="title" 
                        placeholder="Chat Room Name" 
                        className="p-2 border border-gray-300 rounded-md w-full max-w-2xl w-full" 
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-4 items-center">
                        <label htmlFor="persons">Persons:</label>
                        <input 
                            type="number" 
                            id="persons" 
                            className="p-2 border border-gray-300 rounded-md w-[5rem]" 
                            value={personNum} 
                            onChange={(e) => setPersonNum(Number(e.target.value))} 
                            min={1} 
                            max={10}
                            required
                        />
                    </div>
                    {/* ここから */}
                    
                </div>
                <button className="bg-blue-500 text-white p-2 rounded-md w-[10rem] self-center">Create</button>
            </div>
        </div>
    )
}