import os 
from google import genai
from pydantic import BaseModel

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

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

sample_doc = client.files.upload(file='./Raymond Camden.pdf')

prompt = "Parse this resume to find relevant information about the candidate."

response = client.models.generate_content(
	model='gemini-2.0-flash', 
	contents = [prompt, sample_doc],
	config = {
		'response_mime_type': 'application/json', 
		'response_schema': ResumeInfo
	}
)



#response = model.generate_content([sample_doc, prompt])
print(response.text)