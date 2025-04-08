from google import genai
from google.genai import types

import os 
import sys
from slugify import slugify

from PIL import Image

if len(sys.argv) < 2:
  print('Usage: python make_banner_better.py "prompt"')
  sys.exit(1)
else:
  prompt = sys.argv[1]

IMAGEN_API_KEY = os.environ.get('IMAGEN_API_KEY')
imagenClient = genai.Client(api_key=IMAGEN_API_KEY)

response = imagenClient.models.generate_images(
  model='imagen-3.0-generate-002',
  prompt=prompt,
  config=types.GenerateImagesConfig(
    number_of_images=2,
    aspect_ratio="16:9"
  )
)

# Open and display the image using your local operating system.
for x,result in enumerate(response.generated_images):
  filename = f"output/{slugify(prompt)}_{x+1}.png"
  filename_resized = f"output/{slugify(prompt)}_{x+1}.jpg"
  print(f"saving {filename}")
  result.image.save(filename)
  with Image.open(filename) as img:
    img.thumbnail([650,650])
    img.save(filename_resized)
    print(f"saving {filename_resized}")

print("All done")


