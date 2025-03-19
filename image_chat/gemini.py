from google import genai
from google.genai import types 	
import base64
import io 

class Gemini:

	def __init__(self,key):
		self.client = genai.Client(api_key=key)
		self.model = "models/gemini-2.0-flash-exp"

	def handleChat(self, message, picture=None):

		prompt = [message]

		if picture is not None:
			print("WE HAVE AN EXISTING PIC")
			decoded_bytes = base64.b64decode(picture)
			bytes_io = io.BytesIO(decoded_bytes)
			file_ref=self.client.files.upload(file=bytes_io, config={ "mime_type":"image/png" })
			prompt.append(file_ref)


		response = self.client.models.generate_content(
			model=self.model, 
			contents=prompt,
			config=types.GenerateContentConfig(response_modalities=['Text', 'Image'])
		)

		# Ok, so our result will contain text and pictures, we want to gather all the 
		# text, if any, and return ONE picture

		result = {
			"text": "",
			"picture": ""
		}

		for part in response.candidates[0].content.parts:
			if part.text is not None:
				result["text"] += part.text
			elif part.inline_data is not None:
				if result["picture"] == "":
					result["picture"] = base64.b64encode(part.inline_data.data).decode('utf8')

		print("done making stuff, here is my result text if any")
		print(result["text"])
		return result
	
	
