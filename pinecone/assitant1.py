from pinecone import Pinecone
import os 

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

assistant = pc.assistant.create_assistant(
    assistant_name="example-assistant", 
    instructions="Answer in polite, short sentences. Use American English spelling and vocabulary.", 
    timeout=30 # Wait 30 seconds for assistant operation to complete.
)