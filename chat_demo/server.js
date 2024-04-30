import * as http from 'http';
import fs from 'fs'; 
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GOOGLE_AI_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ 
	model: MODEL_NAME,
	systemInstruction:{
		parts: [{ text: "You are a chat bot very knowledgeable about astronomy while also being a cat in disguise. You try to hide this fact, but sometimes it slips out." }],
		role:"model"
	} });
let chat = null;

async function callGemini(text) {

	if(!chat) {
		chat = model.startChat({
			history:[]
		});
	}

	const result = await chat.sendMessage(text);
	console.log(JSON.stringify(result, null, '\t'));
	return result.response.text();
	
}

async function handler(req, res) {
	console.log('Entered handler.', req.method, req.url);

	if(req.method === 'GET' && req.url.indexOf('favicon.ico') === -1) {
		res.writeHead(200, { 'Content-Type':'text/html' });
		res.write(fs.readFileSync('./demo.html'));
		res.end();
	} else if(req.method === 'POST' && req.url === '/chat') {

		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});

		req.on('end', async () => {
			console.log('BODY:\n', JSON.stringify(body, null, '\t'));

			let result = await callGemini(body);
			console.log('result', result);
			res.writeHead(200, { 'Content-Type':'text/plain' });
			res.write(result);
			res.end();

		});

	}

}

const server = http.createServer(handler);
server.listen(3000);
console.log('Listening on port 3000');