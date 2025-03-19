from flask import Flask
from flask import render_template, request 
from gemini import Gemini 
import os 

app = Flask(__name__)

gemini = Gemini(os.environ['GEMINI_KEY'])

@app.route("/")
def hello_world():
	return render_template('index.html')

@app.post("/chat")
def handleChat():
	body = request.get_json()
	message = ""
	if "message" in body:
		message = body["message"]
	picture = None
	if "picture" in body:
		picture = body["picture"]
	print(f"received msg {body["message"]}")
	result = gemini.handleChat(message, picture)

	return result
