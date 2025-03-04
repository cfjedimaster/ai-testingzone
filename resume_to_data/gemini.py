from google import genai
from pydantic import BaseModel
import os 

class WorkExperience(BaseModel):
	company: str
	jobTitle: str
	timeWorked: str 
	description_and_responsibilities: str 

class ResumeInfo(BaseModel):
	firstName: str
	lastName: str
	location: str
	emailAddress: str 
	website: str 
	telephoneNumber: str 
	introduction: str 
	experience: list[WorkExperience] 
	skills: list[str]

class Gemini:
	
	def __init__(self):
		self.client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


	def parse(self, path):
		sample_doc = self.client.files.upload(file=path)
		prompt = "This is a resume. Provide feedback on the resume including suggestions for improvement. After the suggestions, add a dashed line and then provide a text version of the resume with improvements applied."

		prompt = "Parse this resume to find relevant information about the candidate."

		response = self.client.models.generate_content(
			model='gemini-2.0-flash', 
			contents = [prompt, sample_doc],
			config = {
				'response_mime_type': 'application/json', 
				'response_schema': ResumeInfo
			}
		)

		return response.text




