from google import genai
from google.genai import types
import time
import os 
import sys 

# Defines the name of our store
STORE = "Shakespeare Works"

# Defines where our content is
SOURCE = "./source_pdfs"

# Maximum wait time for operations (in seconds)
MAX_OPERATION_WAIT = 300  # 5 minutes

client = genai.Client()

# Step One - do we have our store? We can't search by display name, so need to get all and check
file_search_store = None
for store in client.file_search_stores.list():
    if store.display_name == STORE:
        file_search_store = store
        print(f"Found existing store at {file_search_store.name}")
        print(f"Total docs: {file_search_store.active_documents_count}")
        sys.exit()

if file_search_store is None:
    print("Store not found. Creating new store...")
    try:
        # Create the store...
        file_search_store = client.file_search_stores.create(config={'display_name': STORE})
        print(f"Store created: {file_search_store.name}")
    except Exception as e:
        print(f"Error creating store: {e}")
        sys.exit()

# Validate source directory exists
if not os.path.exists(SOURCE):
    print(f"Error: Source directory '{SOURCE}' does not exist")
    sys.exit()

# List the pdfs...
pdfs = [f for f in os.listdir(SOURCE) if f.lower().endswith('.pdf') and os.path.isfile(os.path.join(SOURCE, f))]

if not pdfs:
    print(f"No PDF files found in {SOURCE}")
    sys.exit()

print(f"Found {len(pdfs)} PDF file(s) to upload")

# Upload each
for pdf in pdfs: 
    print(f"Handling {pdf}")
    try:
        operation = client.file_search_stores.upload_to_file_search_store(
            file=os.path.join(SOURCE, pdf),
            file_search_store_name=file_search_store.name,
            config={
                'display_name': pdf,            
                'custom_metadata': [
                    {'key': 'filename', 'string_value': pdf}
                ]
            },
        )

        # Wait until import is complete with timeout
        start_time = time.time()
        while not operation.done:
            elapsed = time.time() - start_time
            if elapsed > MAX_OPERATION_WAIT:
                print(f"Timeout waiting for {pdf} to upload")
                break
            time.sleep(5)
            operation = client.operations.get(operation)
        
        
        if operation.done:
            print(f"  ✓ Successfully uploaded {pdf}")
        else:
            print(f"  ✗ Upload incomplete for {pdf}")
            
    except Exception as e:
        print(f"  ✗ Error uploading {pdf}: {e}")

print(f"\nStore setup complete. Store: {file_search_store.name}")

