from google import genai
from google.genai import types
import os
import sys
from slugify import slugify

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

if len(sys.argv) < 2:
  print('Usage: python gemini_text_to_image.py "prompt"')
  sys.exit(1)
else:
  prompt = sys.argv[1]

response = client.models.generate_content(
	model="models/gemini-2.0-flash-exp",
	contents=prompt,
	config=types.GenerateContentConfig(response_modalities=['Text', 'Image'])
)

for part in response.candidates[0].content.parts:
	if part.inline_data is not None:
		filename = f"output/{slugify(prompt)}.png"
		print(f"saving {filename}")
		with open(filename, "wb") as file:
			file.write(part.inline_data.data)
		
