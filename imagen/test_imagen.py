from google import genai
from google.genai import types

import os 
from slugify import slugify

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

model_name = "imagen-3.0-generate-002"

prompt = "a cat sleeping under a moonlit sky in the grass, the moon is a crescent and the sky is full of stars. a shooting star is visible in the sky"

result = client.models.generate_image(
    model=model_name,
    prompt=prompt,
    config=types.GenerateImageConfig(
        negative_prompt="",
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
