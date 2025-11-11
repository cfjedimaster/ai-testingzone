from google import genai
from google.genai import types
import time
import os 

# Defines the name of our store
STORE = "Shakespeare Works"

# Defines where our content is
SOURCE = "./source_pdfs"

client = genai.Client()

# Step One - do we have our store? We can't search by display name, so need to get all ahd check
hasStore = False
for file_search_store in client.file_search_stores.list():
    if file_search_store.display_name == STORE:
        hasStore = True
        print(f"Matched store at {file_search_store.name}")
    #print(f"Name={file_search_store.name} / Display Name={file_search_store.display_name}")
    #print(f"Created {file_search_store.create_time}")
    #print(f"Total docs: {file_search_store.active_documents_count}")
    
if not hasStore or True:
    print("We need to create our store.")

    # Create the store...
    file_search_store = client.file_search_stores.create(config={'display_name': STORE})
    
    # List the pdfs...
    pdfs = [f for f in os.listdir(SOURCE) if f.lower().endswith('.pdf') and os.path.isfile(os.path.join(SOURCE, f))]

    # Upload each
    for pdf in pdfs: 
        print(f"Handling {pdf}")
        operation = client.file_search_stores.upload_to_file_search_store(
            file=os.path.join(SOURCE,pdf),
            file_search_store_name=file_search_store.name,
            config={
                'display_name' : pdf,            
                'custom_metadata':[
                {'key':'filename','string_value':pdf}
            ]

            },
        )

        # Wait until import is complete
        while not operation.done:
            time.sleep(5)
            operation = client.operations.get(operation)

#my_file_search_store = client.file_search_stores.get(name='fileSearchStores/o78vgiobiaaa-9lmgrlrj9pq9')
