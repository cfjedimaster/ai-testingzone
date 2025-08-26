from google import genai
import os 
import io
import zipfile 
import rarfile
import sys

client = genai.Client()

prompt = """
You analyze a set of images from a comic book in order to write a summary of the comic in question. You will be given a set of images, in order, representing each page of the comic book. For each page, you will attempt to determine if it's an ad, and if so, ignore it. When done, you should return a one paragraph summary of the comic.
"""

comic_dir = "./comics"

filtered_files = [
    file
    for file in os.listdir(comic_dir)
    if (file.endswith("cbr") or file.endswith("cbz")) and os.path.isfile(os.path.join(comic_dir, file))
]

for comic in filtered_files:
	# check for an existing summary
	summary = f"{os.path.join(comic_dir, os.path.splitext(comic)[0])}.txt"

	gemini_files = []

	if os.path.exists(summary):
		print(f"Summary for {comic} already exists.")
		continue
	
	print(f"Summarizing comicbook {comic}")

	if comic.endswith("cbz"):
		with zipfile.ZipFile(os.path.join(comic_dir,comic),'r') as zip:
			files = zip.namelist()
			# todo - check and see if we need more image extensions
			images = [file for file in files if (file.endswith("jpg") or file.filename.endswith("jpeg"))]
			for index,image in enumerate(images):
				with zip.open(image, 'r') as imgbin:
					print(f'Uploading image {image} ({index+1} of {len(images)})')
					gemini_files.append(client.files.upload(file=io.BytesIO(imgbin.read()), config={"mime_type":"image/jpeg"}))

	elif comic.endswith("cbr"):
		rf = rarfile.RarFile(os.path.join(comic_dir,comic))
		images = [file.filename for file in rf.infolist() if (file.filename.endswith("jpg") or file.filename.endswith("jpeg"))]

		for index,image in enumerate(images):
			print(f'Uploading image {image} ({index+1} of {len(images)})')
			gemini_files.append(client.files.upload(file=io.BytesIO(rf.read(image)), config={"mime_type":"image/jpeg"}))
			
	prompt_contents = [prompt] + gemini_files
	response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt_contents)
	with open(summary,"w") as file:
		file.write(response.text)
	
	print(f"Summary done and saved to {summary}")

			