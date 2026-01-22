from flask import Flask, render_template, request, jsonify, redirect, url_for 
from gemini_service import GeminiService
import math 

app = Flask(__name__)
service = GeminiService()

@app.template_filter('convert_size')
def convert_size(size_bytes):
    """
    Convert bytes to a human-readable format (B, KB, MB, GB, etc.).
    """

    if size_bytes == 0:
        return "0"
    # Units list for IEC standard (base 1024)
    size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
    # Calculate the index of the appropriate unit
    i = int(math.floor(math.log(size_bytes, 1024)))
    # Calculate the power of 1024 for the chosen unit
    p = math.pow(1024, i)
    # Format the size to two decimal places
    s = round(size_bytes / p, 2)
    return "%s %s" % (s, size_name[i])

@app.route('/')
def index():
    stores = service.list_stores()
    return render_template('index.html', stores=stores)

@app.route('/search')
def search():
    stores = service.list_stores()
    return render_template('search.html', stores=stores)

@app.route('/storesearch', methods=['POST'])
def storesearch():
    data = request.get_json()
    store = data.get('store')
    prompt = data.get('query')
    metadata_filter = data.get('metadata')
    print(f"Searching store: {store} with prompt: {prompt} and metadata_filter: {metadata_filter}")
    service = GeminiService()
    result = service.search_store(store, prompt, metadata_filter)
    return jsonify({'result': result})

@app.route('/store')
def store():
    store_id = request.args.get('id')
    if not store_id:
        return "Store ID is required", 400
    
    store = service.get_store(store_id)
    return render_template('store.html', store=store)

@app.route('/uploadToStore', methods=['POST'])
def upload_to_store():
    store_id = request.form.get('store_id')
    files = request.files.getlist('files')
    print(files)
    
    if store_id and files:
        service.store_upload(store_id, files)
    
    return jsonify({'status': 'ok'})

@app.route('/delete_file')
def delete_file():
    file_id = request.args.get('file_id')
    store_id = request.args.get('store_id')
    if not file_id:
        return "File ID is required", 400
    print(f"Deleting file: {file_id}")
    service.delete_file(file_id)
    
    return redirect(url_for('store', id=store_id))

@app.route('/addstore', methods=['POST'])
def add_store():
    store_name = request.form.get('store_name')
    if not store_name:
        return "Store name is required", 400
    
    store_id = service.add_store(store_name)
    return redirect(url_for('store', id=store_id))

@app.route('/delete_store')
def delete_store():

    store_id = request.args.get('store_id')
    if not store_id:
        return "Store ID is required", 400
    print(f"Deleting store: {store_id}")
    service.delete_store(store_id)
    
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)