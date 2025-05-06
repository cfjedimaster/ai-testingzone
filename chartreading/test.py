import sys
import os
from google import genai
from google.genai import types

from pydantic import BaseModel

class ParsedChart(BaseModel):
	description: str
	condfidence: int
	data: object

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def processImage(path):
	file_ref = client.files.upload(file=path)
	prompt = ''

	response = client.models.generate_content(
		model="gemini-2.5-pro-exp-03-25", 
		contents=[prompt, file_ref],
		config=types.GenerateContentConfig(
			system_instruction="You analyze a chart and return a summary of the chart's data, as well as a parsed data set of the values inside. When parsing chart images, be sure to note data points between axis lines. Return a confidence value that ranges from 0 to 1 representing how confident you are in the numbers returned.",
			response_mime_type='application/json'
		)
	)
	return response.text

if len(sys.argv) < 2:
  print('Usage: python test.py "path to chart image"')
  sys.exit(1)
else:
  chart = sys.argv[1]

result = processImage(chart)
print(result)

