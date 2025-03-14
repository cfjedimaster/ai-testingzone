from google import genai
from google.genai import types
import os
from slugify import slugify

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

file_ref = client.files.upload(file="purple_fire.jpg")

contents = ["Using this image as a source, make a picture of a cyberpunk cat holding a futuristic laptop.", file_ref]

response = client.models.generate_content(
	model="models/gemini-2.0-flash-exp",
	contents=contents,
	config=types.GenerateContentConfig(response_modalities=['Text','Image'])
)

for part in enumerate(response.candidates[0].content.parts):
	if part.inline_data is not None:

		filename = f"output/style_demo_{x}.png"
		print(f"saving {filename}")
		with open(filename, "wb") as file:
			file.write(part.inline_data.data)
		