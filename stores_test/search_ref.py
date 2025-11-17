from google import genai
from google.genai import types
import time
import os 

# Defines the name of our store
STORE_NAME = "fileSearchStores/shakespeare-works-b5zezkvl23pb"

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What are the range of themes in these works?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(
            file_search=types.FileSearch(
                  file_search_store_names=[STORE_NAME]
            )
        )]
    )
)

print(response.text)

# Credit: https://colab.research.google.com/github/markmcd/gemini-api-cookbook/blob/e1e740cfa23863d592dc55ea805d5065ba87db98/quickstarts/File_Search.ipynb#scrollTo=08f2fa20812e
import textwrap

grounding = response.candidates[0].grounding_metadata

if grounding and grounding.grounding_chunks:
    print(f"Found {len(grounding.grounding_chunks)} grounding chunks.")
    for i, chunk in enumerate(grounding.grounding_chunks, start=1):
        print(f"\nChunk {i} source: {chunk.retrieved_context.title}")
        print("Chunk text:")
        print(textwrap.indent(chunk.retrieved_context.text[:150] + "...", "  "))
else:
    print("No grounding metadata found.")