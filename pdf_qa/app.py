from flask import Flask, render_template, request
from gemini import Gemini 

# Hard coded path to saved PDF, in a real app, this should be dynamic/per session
PDF = './input.pdf'

app = Flask(__name__)
gemini = Gemini()

@app.route("/")
def hello():
	return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
		# not sure if this extra check is necessary, but extra is extra
		if request.method == 'POST':
			f = request.files['pdf']
			f.save(PDF)
			return { "status": "Ok" }
		
@app.route('/summary')
def summarize_pdf():
	result = gemini.summarize(PDF)
	return { "result": result }

@app.route('/chat', methods=['POST'])
def chat_pdf():
	print("ENTERED CHAT_PDF")
	if request.is_json:
		print("YES JSON")
		data = request.json 

		print(f"Sending {data.get('input')} to gemini")
		result = gemini.chat(PDF, data.get('input'))
		return { "result": result }
	else:
		print("NOT JSON")