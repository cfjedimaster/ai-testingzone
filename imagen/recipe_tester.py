from google import genai
from google.genai import types
import os
import sys
from slugify import slugify

if len(sys.argv) < 2:
  print('Usage: python recipe_tester.py "name of recipe"')
  sys.exit(1)
else:
  recipe = sys.argv[1]


client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

contents = [f'Generate an illustrated recipe for {recipe}. Include ingredients and cooking instructions.']

response = client.models.generate_content(
	model="models/gemini-2.0-flash-exp",
	contents=contents,
	config=types.GenerateContentConfig(response_modalities=['Text', 'Image'])
)

os.makedirs(f"output/{slugify(recipe)}", exist_ok=True)

recipeMD = f"""
# {recipe.title()} Recipe

"""

for x,part in enumerate(response.candidates[0].content.parts):
	if part.text is not None:
		recipeMD += f"""
{part.text}

"""
		#print("TEXT: " + part.text)
	elif part.inline_data is not None:
		
		filename = f"output/{slugify(recipe)}/img_{x}.png"
		print(f"saving {filename}")
		with open(filename, "wb") as file:
			file.write(part.inline_data.data)

		recipeMD += f"""
![Figure](img_{x}.png)

"""		
with open(f"output/{slugify(recipe)}/recipe.md", "w") as file:
	file.write(recipeMD)

print(f"Done, saved to output/{slugify(recipe)}/recipe.md")