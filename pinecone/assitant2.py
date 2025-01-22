from pinecone import Pinecone
import os 

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

assistant = pc.assistant.Assistant(
    assistant_name="example-assistant", 
)

# Upload a file.
response = assistant.upload_file(
    file_path="/home/ray/projects/document-services-demos/source_pdfs/adobe_security_properly_ocr.pdf",
    timeout=None
)

print('done')