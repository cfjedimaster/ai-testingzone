from google import genai
from google.genai import types
import time
import os 

# Defines the name of our store
STORE_NAME = "fileSearchStores/shakespeare-works-crv226w64bo6"

client = genai.Client()


response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Who are the main characters of this document?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(
            file_search=types.FileSearch(
                  file_search_store_names=[STORE_NAME],
                  metadata_filter = 'filename=romeo-and-juliet_PDF_FolgerShakespeare.pdf'
            )
        )]
    )
)

print(response.text)