import os
from google import genai
from google.genai import types

from datetime import datetime 

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not set in environment variables.")

        # Modify as you see fit 
        self.model = "gemini-2.5-flash"

        # Initialize the client for the Gemini Developer API
        self.client = genai.Client(api_key=self.api_key)

    def list_stores(self):
        """
        Lists all existing File Search Stores.
        """
        stores = []
        try:
            # The list method returns an iterator of FileSearchStore objects
            for store in self.client.file_search_stores.list():
                print(store)
                
                if store.create_time is not None:
                    last_updated = store.create_time.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    last_updated = "N/A"

                stores.append({
                    "name":store.name,
                    "display_name": store.display_name if store.display_name else "Untitled Store",
                    "id": store.name, 
                    "document_count": store.active_documents_count if store.active_documents_count else 0, 
                    "last_updated": last_updated,
                    "size": store.size_bytes if store.size_bytes is not None else 0
                })

        except Exception as e:
            print(f"Error listing stores: {e}")
            # In a real app, you might want to re-raise or handle specific errors
        
        return stores

    def search_store(self, store, query, metadata_filter=None):
        """
        Searches the specified store using the provided query and optional metadata filter.
        """
        try:
            print(f"Searching store: {store} with query: {query} and metadata_filter: {metadata_filter}")
            # Configure the tool to use the specified file search store
            tool = types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[store],
                    metadata_filter=metadata_filter
                )
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=query,
                config=types.GenerateContentConfig(
                    tools=[tool]
                )
            )
            return response.text
        except Exception as e:
            print(f"Error searching store: {e}")
            return None