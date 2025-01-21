from google import genai
from google.genai import types

import os 
import sys
from slugify import slugify

if len(sys.argv) < 2:
  print('Usage: python test_imagen.py "prompt"')
  sys.exit(1)
else:
  prompt = sys.argv[1]

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

model_name = "imagen-3.0-generate-002"

result = client.models.generate_image(
    model=model_name,
    prompt=prompt,
    config=types.GenerateImageConfig(
        number_of_images=4,
        output_mime_type="image/jpeg",
        safety_filter_level="BLOCK_MEDIUM_AND_ABOVE",
        person_generation="ALLOW_ADULT",
        aspect_ratio="4:3"
    )

)
# Open and display the image using your local operating system.
for x,result in enumerate(result.generated_images):
  filename = f"output/{slugify(prompt)}_{x+1}.png"
  print(f"saving {filename}")
  result.image.save(filename)
