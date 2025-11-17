from google import genai
from google.genai import types

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