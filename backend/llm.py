import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OpenAI.api_key = OPENAI_API_KEY

client = OpenAI()


def get_response(input, model="gpt-4o", temperature=1, max_output_tokens=1000):
    """memo 例
    input=[
        {
            "role": "developer",
            "content": "Talk like a pirate."
        },
        {
            "role": "user",
            "content": "Are semicolons optional in JavaScript?"
        }
    ]
    """

    response = client.responses.create(
        model=model,
        input=input,
        temperature=temperature,
        max_output_tokens=max_output_tokens,
    )

    return response.output_text
