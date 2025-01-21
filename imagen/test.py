from google import genai
from google.genai import types
import os 

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

response = client.models.generate_image(
    model='imagen-3.0-generate-002',
    prompt='Fuzzy bunnies in my kitchen with a chef watching over them',
    config=types.GenerateImageConfig(
        negative_prompt= 'people',
        number_of_images= 1,
        include_rai_reason= True,
        output_mime_type= 'image/jpeg'
    )
)

response.generated_images[0].image.save('./output/result.jpg')