from google import genai
from google.genai import types
import os 
import sys
from slugify import slugify

"""
Defines the number of images. Imagen supports this, Gemini does not, so we loop for Gemini
"""
IMG_COUNT = 2

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
IMAGEN_API_KEY = os.environ.get('IMAGEN_API_KEY')

geminiClient = genai.Client(api_key=GEMINI_API_KEY)
imagenClient = genai.Client(api_key=IMAGEN_API_KEY)

if len(sys.argv) < 2:
  print('Pass a prompt to this script for testing.')
  sys.exit(1)
else:
  prompt = sys.argv[1]

def makeGeminiImage(prompt,idx):
	response = geminiClient.models.generate_content(
		model="gemini-2.0-flash-exp",
		contents=prompt,
		config=types.GenerateContentConfig(response_modalities=['Text', 'Image'])
	)

	for part in response.candidates[0].content.parts:
		if part.inline_data is not None:
			filename = f"output/gemini_{slugify(prompt)}_{idx+1}.png"
			print(f"saving {filename}")
			with open(filename, "wb") as file:
				file.write(part.inline_data.data)

def makeImagenImage(prompt,total):

	response = imagenClient.models.generate_images(
		model='imagen-3.0-generate-002',
		prompt=prompt,
		config=types.GenerateImagesConfig(
			number_of_images=total,
		)
	)

	# Open and display the image using your local operating system.
	for x,result in enumerate(response.generated_images):
		filename = f"output/imagen_{slugify(prompt)}_{x+1}.png"
		print(f"saving {filename}")
		result.image.save(filename)


# Do imagen first
print(f"Creating {IMG_COUNT} images with Imagen...")
makeImagenImage(prompt,IMG_COUNT)

print(f"Creating {IMG_COUNT} images with Gemini...")
for i in range(IMG_COUNT):
	makeGeminiImage(prompt,i)

