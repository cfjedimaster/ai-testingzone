from google import genai
from pydantic import BaseModel
import os 


class Gemini:
	
	def __init__(self):
		self.client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
		self.doc = None 

	def summarize(self, path):
		# In theory, this is dumb, we upload once in our POC
		if self.doc is None:
			print("Uploading PDF")
			self.doc = self.client.files.upload(file=path)

		prompt = """
Please act as an expert summarizer. Analyze the provided PDF document and create a concise and comprehensive summary of its key contents. Your summary should focus on the main arguments, conclusions, and any significant data or findings. It should be written in a clear, neutral tone and be easy for a non-expert to understand.		
		"""

		response = self.client.models.generate_content(
			model='gemini-2.5-flash', 
			contents = [prompt, self.doc],
			config = {
				'response_mime_type': 'text/plain', 
			}
		)

		return response.text
	
	def chat(self, path, prompt):
		# ditto, also dumb, can't get here until you summarize, but whatev
		if self.doc is None:
			print("Uploading PDF")
			self.doc = self.client.files.upload(file=path)


		response = self.client.models.generate_content(
			model='gemini-2.5-flash', 
			contents = [prompt, self.doc],
			config = {
				'response_mime_type': 'text/plain', 
			}
		)

		return response.text	