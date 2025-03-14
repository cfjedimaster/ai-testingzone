from google import genai
from google.genai import types
import os
from slugify import slugify

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

file_ref = client.files.upload(file="empire2.jpg")

#contents = ["Using this image as a logo, apply it to the side of a commercial airplane.", file_ref]
contents = ["Using this image as a logo, apply it to a flag waving by a drab government building. The flag should have nothing on it but the logo itself.", file_ref]
response = client.models.generate_content(
	model="models/gemini-2.0-flash-exp",
	contents=contents,
	config=types.GenerateContentConfig(response_modalities=['Text','Image'])
)



for x,part in enumerate(response.candidates[0].content.parts):
	if part.inline_data is not None:

		filename = f"output/logo_demo_{x}.png"
		print(f"saving {filename}")
		with open(filename, "wb") as file:
			file.write(part.inline_data.data)
		