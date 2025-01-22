# To use the Python SDK, install the plugin:
# pip install --upgrade pinecone pinecone-plugin-assistant

from pinecone import Pinecone
from pinecone_plugins.assistant.models.chat import Message
import json 
import os 

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
assistant = pc.assistant.Assistant(assistant_name="example-assistant")

msg = Message(role="user", content="What are the security levels at Adobe?")
resp = assistant.chat(messages=[msg], json_response=True)

# Alternatively, you can provide a dictionary as the message:
# msg = {"role": "user", "content": "Who is the CFO of Netflix?"}
# resp = assistant.chat(messages=[msg])

print(json.loads(resp.message.content))
for citation in resp.citations:
	print(f"I found matches on pages {citation['references'][0]['pages']}")
	print(f"len test, {len(citation['references'])}")
	print('-------------------------------------------')