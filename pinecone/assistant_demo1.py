from pinecone import Pinecone
from pinecone_plugins.assistant.models.chat import Message
import os, sys, time

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

assistant_name = "shakespeare-assistant"

# Step one, figure out if we need to make the assistant

assistants = pc.assistant.list_assistants()
matches = [x for x in assistants if x.name == assistant_name]
if not matches:
	print(f"Creating assistant {assistant_name}")

	assistant = pc.assistant.create_assistant(
		assistant_name, 
		instructions="Answer for readers of a high school level. Use American English spelling and vocabulary.", 
		timeout=30 
	)
else:
	print(f"{assistant_name} already exists")

# Step two, check the status of the assistant to ensure its status is Ready
ready = False

while not ready:
	assistant = pc.assistant.describe_assistant(assistant_name)
	if assistant.status == "Ready":
		print(f"Assistant {assistant_name} is ready.")
		ready = True
	else:
		if assistant.status == "Failed":
			print("Assistant failed to initialize.")
			sys.exit(1)
		else:
			print(f"Assistant status is {assistant.status}. Waiting for Ready.")
			time.sleep(5)

# Get the assistant now that it's done
assistant = pc.assistant.Assistant(assistant_name)

pdfs = []
for file in os.listdir("./"):
	if file.endswith(".pdf"):
		pdfs.append(file)

print(f"Found {len(pdfs)} PDFs we may need to add to our index.")

currentfiles = assistant.list_files()
for file in pdfs:
	matches = [x for x in currentfiles if x.name == file]
	if not matches:
		print(f"Uploading {file}")
		response = assistant.upload_file(
			file_path=file,
			timeout=None
		)
	else:
		print(f"{file} already uploaded")

# At this point, setup is done. We _could_ add a step to loop until Available, but in theory, btw we get 
# to the next step, it's not a concern. Maybe I'm being lazy too. ;)
print("Script done, may need to wait for PDFs to process.")

