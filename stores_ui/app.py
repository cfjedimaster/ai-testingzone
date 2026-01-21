from flask import Flask, render_template, request, jsonify
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)