from pinecone import Pinecone
from pinecone_plugins.assistant.models.chat import Message
import os, sys

if len(sys.argv) < 2:
  print("Pass your prompt as an argument.")
  sys.exit(1)
else:
  prompt = sys.argv[1]

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

assistant_name = "shakespeare-assistant"

assistant = pc.assistant.Assistant(assistant_name)

msg = Message(role="user", content=prompt)
resp = assistant.chat(messages=[msg])

print(resp.message.content)

print("--------------------------------------------")
print("Citations:")

for citation in resp.citations:
	
	for x,ref in enumerate(citation["references"]):
		print(f"Reference {x+1} - pages {ref['pages']} in file {ref['file']['name']}")
	
