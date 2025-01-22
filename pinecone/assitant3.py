from pinecone import Pinecone
import os 

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

assistant = pc.assistant.Assistant(
    assistant_name="example-assistant", 
)

files = assistant.list_files()

for file in files:
    print(f"File {file['name']}, status {file['status']}")

#print(files)