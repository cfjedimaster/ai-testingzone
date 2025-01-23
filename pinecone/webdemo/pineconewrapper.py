from pinecone import Pinecone
from pinecone_plugins.assistant.models.chat import Message
import os

class PineconeWrapper:
	
	def __init__(self):
		self.assistant_name = "shakespeare-assistant"
		self.pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
		self.assistant = self.pc.assistant.Assistant(self.assistant_name)

	def executePrompt(self, prompt):
		
		msg = Message(role="user", content=prompt)
		resp = self.assistant.chat(messages=[msg])
		
		result = {
			"content": resp.message.content,
			"citations": []
		}

		for citation in resp.citations:	
			for ref in citation["references"]:
				result["citations"].append({
					"pages": ref["pages"],
					"file": ref["file"]["name"]
				})
				
		return result		
	
