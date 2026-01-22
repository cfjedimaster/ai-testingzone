import os
from google import genai
from google.genai import types

from datetime import datetime 

import tempfile
import time 

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

    def get_store(self, store_id):
        """
        Gets detailed information about a specific store.
        """
        store_data = None
        try:
            store = self.client.file_search_stores.get(name=store_id)

            store_data = {
                "name": store.name,
                "display_name": store.display_name if store.display_name else "Untitled Store",
                "id": store.name,
                "document_count": store.active_documents_count if store.active_documents_count else 0,
                "last_updated": store.create_time.strftime('%Y-%m-%d %H:%M:%S') if store.create_time else "N/A",
                "size": store.size_bytes if store.size_bytes is not None else 0,
                "files": [] 
            }

            documents = self.client.file_search_stores.documents.list(parent=store_id)
            for document in documents:
                store_data["files"].append({
                    "name": document.display_name if document.display_name else "Untitled Document",
                    "id": document.name,
                    "size": document.size_bytes if document.size_bytes is not None else 0,
                    "last_updated": document.create_time.strftime('%Y-%m-%d %H:%M:%S') if document.create_time else "N/A"
                })
            print("----------------")
            print(store_data["files"])
        except Exception as e:
            print(f"Error getting store: {e}")
        
        return store_data

    def store_upload(self, store_id, files):
        """
        Uploads a list of files to the specified store.
        """
        
        for file in files:
            try:
                # Create a temporary file to save the uploaded content
                # We preserve the extension for MIME type detection if needed
                suffix = os.path.splitext(file.filename)[1]
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                    temp_path = temp_file.name
                
                file.save(temp_path)
                #self.client.file_search_stores.upload_to_file_search_store(name=store_id, file=temp_path)
                operation = self.client.file_search_stores.upload_to_file_search_store(
                            file=temp_path,
                            file_search_store_name=store_id,
                            config={
                                'display_name': file.filename,            
                                'custom_metadata': [
                                    {'key': 'filename', 'string_value': file.filename}
                                ]
                            },
                        )

                while not operation.done:
                    print("Sleeping for 2 seconds while we wait for the file to finish uploading")
                    time.sleep(2)
                    operation = self.client.operations.get(operation)

                # Clean up
                os.remove(temp_path)
            except Exception as e:
                print(f"Error uploading file {file.filename}: {e}")

    def delete_file(self, file_name):
        """
        Deletes a file from the store.
        """
        try:
            self.client.file_search_stores.documents.delete(name=file_name, config={'force':True})
        except Exception as e:
            print(f"Error deleting file {file_name}: {e}")

    def add_store(self, store_name):
        """
        Creates a new store with the given name.
        """
        try:
            store = self.client.file_search_stores.create(
                config={'display_name': store_name}
            )
            return store.name
        except Exception as e:
            print(f"Error creating store: {e}")
            return None

    def delete_store(self, store_id):
        """
        Deletes a store.
        """
        try:
            self.client.file_search_stores.delete(name=store_id, config={'force':True})
        except Exception as e:
            print(f"Error deleting store {store_id}: {e}")