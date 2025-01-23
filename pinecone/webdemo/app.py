from flask import Flask
from flask import render_template, request

from pineconewrapper import PineconeWrapper

app = Flask(__name__)
pineconeWrapper = PineconeWrapper()

@app.route("/")
def homepage():
	return render_template('index.html')

@app.post("/handlePrompt")
def handlePrompt():
	prompt = request.json["prompt"]
	print(f"testing prompt, {prompt}")
	result = pineconeWrapper.executePrompt(prompt)
	return result
