"use client";
import { useState } from "react";
import { ChatbotInput } from "../types";

export const CreatePerson = () => {
  const [personText, setPersonText] = useState<ChatbotInput>({
    name: "",
    persona: "",
    isUser: false, // Default value for isUser
  });

  const onChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
  ) => {
    setPersonText((prev: ChatbotInput) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const submitPerson = () => {
    const data = fetch("/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(personText),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create person");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Person created successfully:", data);
      })
      .catch((error) => {
        console.error("Error creating person:", error);
      });

    setPersonText({
      name: "",
      persona: "",
      isUser: false, // Reset to default after submission
    });
  };

  return (
    <div>
      <input type="text" onChange={(e) => onChangeInput(e, "name")} />
      <textarea
        placeholder="personaの情報を入力してください"
        onChange={(e) => onChangeInput(e, "persona")}
      ></textarea>

      <button onClick={submitPerson}>Create</button>
    </div>
  );
};
